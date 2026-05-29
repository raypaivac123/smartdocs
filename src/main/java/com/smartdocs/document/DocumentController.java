package com.smartdocs.document;

import com.smartdocs.task.Task;
import com.smartdocs.task.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService service;
    private final TaskRepository  taskRepo;

    @PostMapping(value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto> upload(
            @RequestParam("file") MultipartFile file) throws IOException {
        Document doc = service.upload(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(DocumentDto.from(doc, List.of()));
    }

    @GetMapping
    public ResponseEntity<PageResponse<DocumentDto>> list(
            @RequestParam(defaultValue = "")  String search,
            @RequestParam(defaultValue = "")  String classification,
            @RequestParam(defaultValue = "")  String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20")int size) {

        Page<Document> docs = service.findAll(
                search, classification, status, page, size);
        Page<DocumentDto> dtos = docs.map(d -> DocumentDto.from(d, List.of()));
        return ResponseEntity.ok(PageResponse.from(dtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getById(@PathVariable UUID id) {
        Document doc = service.findById(id);
        List<Task> tasks = taskRepo.findByDocumentId(id);
        return ResponseEntity.ok(DocumentDto.from(doc, tasks));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /* ── DTOs internos ───────────────────────────────────── */
    record DocumentDto(
            String id, String filename, String classification,
            String status, Integer pageCount, Double fileSizeMb,
            String summary, Map<String, String> extractedFields,
            String uploadedBy, String uploadedAt, List<TaskDto> tasks
    ) {
        static DocumentDto from(Document d, List<Task> tasks) {
            return new DocumentDto(
                    d.getId().toString(), d.getFilename(),
                    d.getClassification() != null ? d.getClassification().name() : null,
                    d.getStatus().name().toLowerCase(),
                    d.getPageCount(),
                    d.getFileSizeBytes() != null
                            ? Math.round(d.getFileSizeBytes() / 10485.76) / 100.0 : null,
                    d.getSummary(), d.getExtractedFields(),
                    d.getUploadedBy() != null ? d.getUploadedBy().getName() : null,
                    d.getUploadedAt() != null ? d.getUploadedAt().toString() : null,
                    tasks.stream().map(TaskDto::from).collect(Collectors.toList())
            );
        }
    }

    record TaskDto(
            String id, String title, String status,
            String priority, String dueDate, String documentId
    ) {
        static TaskDto from(Task t) {
            return new TaskDto(
                    t.getId().toString(), t.getTitle(),
                    t.getStatus().name().toLowerCase().replace("_", "-"),
                    t.getPriority().name().toLowerCase(),
                    t.getDueDate() != null ? t.getDueDate().toString() : null,
                    t.getDocument() != null ? t.getDocument().getId().toString() : null
            );
        }
    }

    record PageResponse<T>(
            List<T> content, long totalElements, int totalPages, int number
    ) {
        static <T> PageResponse<T> from(Page<T> p) {
            return new PageResponse<>(
                    p.getContent(), p.getTotalElements(),
                    p.getTotalPages(), p.getNumber());
        }
    }
}