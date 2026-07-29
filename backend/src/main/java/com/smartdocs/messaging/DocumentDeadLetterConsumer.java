package com.smartdocs.messaging;

import com.smartdocs.document.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentDeadLetterConsumer {

    private final DocumentService documentService;

    @RabbitListener(queues = "${smartdocs.rabbitmq.dlq}")
    public void consume(DocumentProcessingMessage message) {
        log.error("Document {} exhausted all processing retries, marking as ERROR", message.documentId());

        documentService.markAsPermanentlyFailed(
                message.documentId(),
                "Processing failed after multiple retries"
        );
    }
}
