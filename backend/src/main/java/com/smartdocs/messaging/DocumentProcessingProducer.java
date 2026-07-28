package com.smartdocs.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentProcessingProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${smartdocs.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${smartdocs.rabbitmq.routing-key}")
    private String routingKey;

    public void sendDocumentForProcessing(UUID documentId) {
        DocumentProcessingMessage message = new DocumentProcessingMessage(documentId);

        rabbitTemplate.convertAndSend(
                exchangeName,
                routingKey,
                message
        );
    }
}