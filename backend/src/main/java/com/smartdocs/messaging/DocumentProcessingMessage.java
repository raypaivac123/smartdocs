package com.smartdocs.messaging;

import java.util.UUID;

public record DocumentProcessingMessage(UUID documentId) {
}