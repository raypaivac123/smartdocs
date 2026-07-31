package com.smartdocs.document;

import com.smartdocs.ai.DocumentAiAnalyzer;
import com.smartdocs.audit.AuditService;
import com.smartdocs.auth.User;
import com.smartdocs.auth.UserRepository;
import com.smartdocs.messaging.DocumentProcessingProducer;
import com.smartdocs.task.Task;
import com.smartdocs.task.TaskRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepo;

    @Mock
    private TaskRepository taskRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private DocumentAiAnalyzer aiAnalyzer;

    @Mock
    private AuditService auditService;

    @Mock
    private DocumentProcessingProducer documentProcessingProducer;

    @InjectMocks
    private DocumentService documentService;

    @BeforeEach
    void setUp() {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken("dev@smartdocs.de", null);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        ReflectionTestUtils.setField(documentService, "storagePath", "target/test-uploads");
    }

    @Test
    void uploadShouldSaveDocumentAsPendingAndSendItToRabbitMQ() throws Exception {
        User user = User.builder()
                .name("Ana Becker")
                .email("dev@smartdocs.de")
                .build();

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "contract.pdf",
                "application/pdf",
                "fake pdf content".getBytes()
        );

        when(userRepo.findByEmail("dev@smartdocs.de"))
                .thenReturn(Optional.of(user));

        when(documentRepo.save(any(Document.class)))
                .thenAnswer(invocation -> {
                    Document document = invocation.getArgument(0);
                    ReflectionTestUtils.setField(document, "id", UUID.randomUUID());
                    return document;
                });

        Document result = documentService.upload(file);

        assertThat(result).isNotNull();
        assertThat(result.getFilename()).isEqualTo("contract.pdf");
        assertThat(result.getStatus()).isEqualTo(Document.DocumentStatus.PENDING);
        assertThat(result.getUploadedBy()).isEqualTo(user);

        verify(documentRepo, times(1)).save(any(Document.class));
        verify(auditService, times(1))
                .log(eq("UPLOAD"), eq("Document"), any(), contains("contract.pdf"));
        verify(documentProcessingProducer, times(1))
                .sendDocumentForProcessing(any(UUID.class));
    }

    @Test
    void uploadShouldRejectEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        assertThatThrownBy(() -> documentService.upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File is empty.");

        verify(documentRepo, never()).save(any(Document.class));
        verify(documentProcessingProducer, never()).sendDocumentForProcessing(any(UUID.class));
        verify(auditService, never()).log(any(), any(), any(), any());
    }

    @Test
    void uploadShouldRejectNonPdfFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "fake image content".getBytes()
        );

        assertThatThrownBy(() -> documentService.upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only PDF files are allowed.");

        verify(documentRepo, never()).save(any(Document.class));
        verify(documentProcessingProducer, never()).sendDocumentForProcessing(any(UUID.class));
        verify(auditService, never()).log(any(), any(), any(), any());
    }

    @Test
    void uploadShouldRejectFileWithoutName() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                null,
                "application/pdf",
                "fake pdf content".getBytes()
        );

        assertThatThrownBy(() -> documentService.upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only PDF files are allowed.");

        verify(documentRepo, never()).save(any(Document.class));
        verify(documentProcessingProducer, never()).sendDocumentForProcessing(any(UUID.class));
        verify(auditService, never()).log(any(), any(), any(), any());
    }

    @Test
    void processDocumentShouldMarkDocumentAsProcessedWhenAiReturnsAnalysis() throws Exception {
        UUID documentId = UUID.randomUUID();
        Path pdfPath = createBlankPdf("contract-test.pdf");

        User user = User.builder()
                .name("Ana Becker")
                .email("dev@smartdocs.de")
                .build();

        Document document = Document.builder()
                .filename("contract-test.pdf")
                .originalFilename("contract-test.pdf")
                .filePath(pdfPath.toString())
                .status(Document.DocumentStatus.PENDING)
                .uploadedBy(user)
                .build();
        ReflectionTestUtils.setField(document, "id", documentId);

        DocumentAiAnalyzer.DocumentAnalysis analysis =
                new DocumentAiAnalyzer.DocumentAnalysis(
                        "CONTRACT",
                        Map.of(
                                "customer", "ACME GmbH",
                                "documentType", "Contract"
                        ),
                        "This is a short contract summary.",
                        List.of("Review contract terms")
                );

        when(documentRepo.findById(documentId)).thenReturn(Optional.of(document));
        when(aiAnalyzer.analyzeDocument(any(), eq("contract-test.pdf")))
                .thenReturn(analysis);
        when(taskRepo.save(any(Task.class)))
                .thenAnswer(invocation -> {
                    Task task = invocation.getArgument(0);
                    ReflectionTestUtils.setField(task, "id", UUID.randomUUID());
                    return task;
                });

        documentService.processDocument(documentId);

        assertThat(document.getStatus()).isEqualTo(Document.DocumentStatus.PROCESSED);
        assertThat(document.getClassification()).isEqualTo(Document.Classification.CONTRACT);
        assertThat(document.getSummary()).isEqualTo("This is a short contract summary.");
        assertThat(document.getExtractedFields())
                .containsEntry("customer", "ACME GmbH")
                .containsEntry("documentType", "Contract");
        assertThat(document.getProcessedAt()).isNotNull();
        assertThat(document.getPageCount()).isEqualTo(1);

        verify(documentRepo, times(1)).save(document);
        verify(aiAnalyzer, times(1)).analyzeDocument(any(), eq("contract-test.pdf"));
        verify(taskRepo, times(1)).save(any());
        verify(auditService, times(1))
                .log(eq("PROCESSED"), eq("Document"), eq(documentId.toString()), contains("CONTRACT"));
    }

    @Test
    void processDocumentShouldThrowWhenAiFailsSoRabbitMqCanRetry() throws Exception {
        UUID documentId = UUID.randomUUID();
        Path pdfPath = createBlankPdf("contract-with-error.pdf");

        User user = User.builder()
                .name("Ana Becker")
                .email("dev@smartdocs.de")
                .build();

        Document document = Document.builder()
                .filename("contract-with-error.pdf")
                .originalFilename("contract-with-error.pdf")
                .filePath(pdfPath.toString())
                .status(Document.DocumentStatus.PENDING)
                .uploadedBy(user)
                .build();
        ReflectionTestUtils.setField(document, "id", documentId);

        when(documentRepo.findById(documentId)).thenReturn(Optional.of(document));
        when(aiAnalyzer.analyzeDocument(any(), eq("contract-with-error.pdf")))
                .thenThrow(new RuntimeException("Simulated AI failure"));

        assertThatThrownBy(() -> documentService.processDocument(documentId))
                .isInstanceOf(DocumentProcessingException.class)
                .hasCauseInstanceOf(RuntimeException.class);

        assertThat(document.getStatus()).isEqualTo(Document.DocumentStatus.PENDING);

        verify(documentRepo, never()).save(any(Document.class));
        verify(aiAnalyzer, times(1)).analyzeDocument(any(), eq("contract-with-error.pdf"));
        verify(taskRepo, never()).save(any());
        verify(auditService, never()).log(any(), any(), any(), any());
    }

    @Test
    void markAsPermanentlyFailedShouldSetErrorStatusAndAudit() {
        UUID documentId = UUID.randomUUID();
        Document document = Document.builder()
                .filename("contract.pdf")
                .status(Document.DocumentStatus.PENDING)
                .build();
        ReflectionTestUtils.setField(document, "id", documentId);

        when(documentRepo.findById(documentId)).thenReturn(Optional.of(document));

        documentService.markAsPermanentlyFailed(documentId, "Processing failed after multiple retries");

        assertThat(document.getStatus()).isEqualTo(Document.DocumentStatus.ERROR);
        assertThat(document.getErrorMessage()).isEqualTo("Processing failed after multiple retries");

        verify(documentRepo, times(1)).save(document);
        verify(auditService, times(1))
                .log(eq("ERROR"), eq("Document"), eq(documentId.toString()), contains("retries exhausted"));
    }

    @Test
    void reprocessShouldResetStatusToPendingAndRepublishToQueue() {
        UUID documentId = UUID.randomUUID();
        Document document = Document.builder()
                .filename("contract.pdf")
                .status(Document.DocumentStatus.ERROR)
                .errorMessage("Simulated AI failure")
                .build();
        ReflectionTestUtils.setField(document, "id", documentId);

        when(documentRepo.findById(documentId)).thenReturn(Optional.of(document));

        Document result = documentService.reprocess(documentId);

        assertThat(result.getStatus()).isEqualTo(Document.DocumentStatus.PENDING);
        assertThat(result.getErrorMessage()).isNull();

        verify(documentRepo, times(1)).save(document);
        verify(auditService, times(1))
                .log(eq("REPROCESS"), eq("Document"), eq(documentId.toString()), contains("contract.pdf"));
        verify(documentProcessingProducer, times(1)).sendDocumentForProcessing(documentId);
    }

    private Path createBlankPdf(String filename) throws Exception {
        Path testDir = Path.of("target/test-files");
        Files.createDirectories(testDir);
        Path pdfPath = testDir.resolve(filename);

        try (PDDocument pdf = new PDDocument()) {
            pdf.addPage(new PDPage());
            pdf.save(pdfPath.toFile());
        }

        return pdfPath;
    }
}
