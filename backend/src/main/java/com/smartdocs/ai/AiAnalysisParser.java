package com.smartdocs.ai;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

final class AiAnalysisParser {

    private AiAnalysisParser() {}

    @SuppressWarnings("unchecked")
    static DocumentAiAnalyzer.DocumentAnalysis parse(ObjectMapper objectMapper, String json) {
        try {
            Map<String, Object> parsed = objectMapper.readValue(json, Map.class);
            return new DocumentAiAnalyzer.DocumentAnalysis(
                    (String) parsed.get("classification"),
                    (Map<String, String>) parsed.get("extractedFields"),
                    (String) parsed.get("summary"),
                    (List<String>) parsed.get("tasks")
            );
        } catch (Exception e) {
            throw new IllegalStateException("Invalid AI response: " + json, e);
        }
    }
}
