package com.smartdocs.ai;

final class AiPromptBuilder {

    private AiPromptBuilder() {}

    static String buildDocumentAnalysisPrompt(String text, String filename) {
        return """
            You are an AI assistant for business document analysis.
            Analyze the following document and respond ONLY with one JSON object.
            Do not include Markdown or any text before or after the JSON.

            Filename: %s

            Document content:
            ---
            %s
            ---

            Respond with exactly this JSON shape:
            {
              "classification": "CONTRACT|INVOICE|APPLICATION|REPORT|LEGAL_DOCUMENT",
              "extractedFields": {
                "fieldName": "value"
              },
              "summary": "Short professional English summary in 2-3 sentences",
              "tasks": ["Task 1", "Task 2"]
            }

            Rules:
            - classification: choose the best matching type
            - extractedFields: include 4-8 important fields from the document
            - summary: keep it precise and professional, in English
            - tasks: include 1-3 concrete follow-up actions from the document
            - return valid JSON only
            """.formatted(filename, text.substring(0, Math.min(text.length(), 8000)));
    }
}
