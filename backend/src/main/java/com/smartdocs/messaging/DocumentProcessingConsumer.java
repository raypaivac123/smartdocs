package com.smartdocs.messaging;

import com.smartdocs.document.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentProcessingConsumer {

    private final DocumentService documentService;

    @RabbitListener(queues = "${smartdocs.rabbitmq.queue}")
    public void consume(DocumentProcessingMessage message) {
        log.info("Mensagem recebida do RabbitMQ para processar documento: {}", message.documentId());

        documentService.processDocument(message.documentId());
    }
}