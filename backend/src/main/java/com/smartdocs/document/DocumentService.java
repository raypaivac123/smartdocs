package com.smartdocs.document;

import com.smartdocs.ai.ClaudeService;
import com.smartdocs.audit.AuditService;
import com.smartdocs.auth.User;
import com.smartdocs.auth.UserRepository;
import com.smartdocs.messaging.DocumentProcessingProducer;
import com.smartdocs.task.Task;
import com.smartdocs.task.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepo;
    private final TaskRepository taskRepo;
    private final UserRepository userRepo;
    private final ClaudeService claudeService;
    private final AuditService auditService;
    private final DocumentProcessingProducer documentProcessingProducer;

    @Value("${smartdocs.storage.path}")
    private String storagePath;

    @Transactional
    public Document upload(MultipartFile file) throws IOException {
        validateFile(file);

        User uploader = currentUser();

        Path dir = Paths.get(storagePath).toAbsolutePath();
        Files.createDirectories(dir);

        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = dir.resolve(storedName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Document doc = Document.builder()
                .filename(file.getOriginalFilename())
                .originalFilename(file.getOriginalFilename())
                .filePath(filePath.toString())
                .fileSizeBytes(file.getSize())
                .status(Document.DocumentStatus.PENDING)
                .uploadedBy(uploader)
                .build();

        doc = documentRepo.save(doc);

        auditService.log(
                "UPLOAD",
                "Document",
                doc.getId().toString(),
                file.getOriginalFilename() + " uploaded"
        );

        documentProcessingProducer.sendDocumentForProcessing(doc.getId());

        return doc;
    }

    @Transactional
    public void processDocument(UUID docId) {
        documentRepo.findById(docId).ifPresent(doc -> {
            try {
                log.info("Processing document via RabbitMQ: {}", doc.getFilename());

                String text = extractText(doc.getFilePath());
                var analysis = claudeService.analyzeDocument(text, doc.getFilename());

                doc.setClassification(parseClassification(analysis.classification()));
                doc.setExtractedFields(
                        analysis.extractedFields() != null
                                ? analysis.extractedFields()
                                : java.util.Map.of()
                );
                doc.setSummary(analysis.summary());
                doc.setStatus(Document.DocumentStatus.PROCESSED);
                doc.setProcessedAt(Instant.now());
                doc.setPageCount(countPages(doc.getFilePath()));

                documentRepo.save(doc);

                if (analysis.tasks() != null) {
                    Document saved = doc;

                    analysis.tasks().forEach(title -> {
                        Task task = Task.builder()
                                .title(title)
                                .document(saved)
                                .status(Task.TaskStatus.PENDING)
                                .priority(Task.Priority.MEDIUM)
                                .build();

                        task = taskRepo.save(task);

                        auditService.log(
                                "TASK_GEN",
                                "Task",
                                task.getId().toString(),
                                "Task automatically created from document " + saved.getId()
                        );
                    });
                }

                auditService.log(
                        "PROCESSED",
                        "Document",
                        doc.getId().toString(),
                        "AI analysis: " + analysis.classification()
                );
            } catch (Exception e) {
                log.error("Error processing document {}: {}", docId, e.getMessage());

                doc.setStatus(Document.DocumentStatus.ERROR);
                doc.setErrorMessage(e.getMessage());

                documentRepo.save(doc);

                auditService.log(
                        "ERROR",
                        "Document",
                        docId.toString(),
                        "Failure: " + e.getMessage()
                );
            }
        });
    }

    @Transactional(readOnly = true)
    public Page<Document> findAll(String search, String classification,
                                  String status, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("uploadedAt").descending()
        );

        Document.Classification cls = parseClassification(classification);
        Document.DocumentStatus st = parseStatus(status);

        Page<Document> documents = documentRepo.findAll((root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();

            if (search != null && !search.isBlank()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("filename")),
                                "%" + search.toLowerCase() + "%"
                        )
                );
            }

            if (cls != null) {
                predicates.add(cb.equal(root.get("classification"), cls));
            }

            if (st != null) {
                predicates.add(cb.equal(root.get("status"), st));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);

        documents.getContent().forEach(document -> {
            if (document.getUploadedBy() != null) {
                document.getUploadedBy().getName();
            }

            if (document.getTasks() != null) {
                document.getTasks().size();
            }
        });

        return documents;
    }

    @Transactional(readOnly = true)
    public Document findById(UUID id) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Document not found: " + id
                ));

        if (document.getUploadedBy() != null) {
            document.getUploadedBy().getName();
        }

        if (document.getTasks() != null) {
            document.getTasks().size();
        }

        return document;
    }

    @Transactional
    public void delete(UUID id) {
        Document doc = findById(id);

        if (doc.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(doc.getFilePath()));
            } catch (IOException e) {
                log.warn("File not found: {}", doc.getFilePath());
            }
        }

        documentRepo.delete(doc);

        auditService.log(
                "DELETE",
                "Document",
                id.toString(),
                doc.getFilename() + " deleted"
        );
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }

        String name = file.getOriginalFilename();

        if (name == null || !name.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed.");
        }

        if (file.getSize() > 20L * 1024 * 1024) {
            throw new IllegalArgumentException("File too large. Maximum: 20 MB.");
        }
    }

    private String extractText(String filePath) throws IOException {
        try (PDDocument pdf = Loader.loadPDF(Paths.get(filePath).toFile())) {
            return new PDFTextStripper().getText(pdf);
        }
    }

    private int countPages(String filePath) {
        try (PDDocument pdf = Loader.loadPDF(Paths.get(filePath).toFile())) {
            return pdf.getNumberOfPages();
        } catch (Exception e) {
            return 0;
        }
    }

    private Document.Classification parseClassification(String val) {
        if (val == null || val.isBlank()) {
            return null;
        }

        try {
            return Document.Classification.valueOf(val.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private Document.DocumentStatus parseStatus(String val) {
        if (val == null || val.isBlank()) {
            return null;
        }

        try {
            return Document.DocumentStatus.valueOf(val.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepo.findByEmail(email).orElse(null);
    }
}
