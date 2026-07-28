package com.smartdocs.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClaudeService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.api.url}")
    private String apiUrl;

    @Value("${anthropic.model}")
    private String model;

    @Value("${anthropic.max-tokens:2048}")
    private int maxTokens;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public DocumentAnalysis analyzeDocument(String text, String filename) {
        String prompt = buildPrompt(text, filename);

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );
            String content = extractContent(response.getBody());
            return parseAnalysis(content);
        } catch (Exception e) {
            log.error("Claude API error for '{}': {}", filename, e.getMessage());
            throw new RuntimeException("AI analysis failed: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(String text, String filename) {
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

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> body) {
        List<Map<String, Object>> content =
                (List<Map<String, Object>>) body.get("content");
        if (content == null || content.isEmpty()) {
            throw new RuntimeException("Empty Claude API response.");
        }
        return (String) content.get(0).get("text");
    }

    @SuppressWarnings("unchecked")
    private DocumentAnalysis parseAnalysis(String json) {
        try {
            Map<String, Object> parsed = objectMapper.readValue(json, Map.class);
            return new DocumentAnalysis(
                    (String) parsed.get("classification"),
                    (Map<String, String>) parsed.get("extractedFields"),
                    (String) parsed.get("summary"),
                    (List<String>) parsed.get("tasks")
            );
        } catch (Exception e) {
            log.error("Failed to parse Claude response: {}", json);
            throw new RuntimeException("Invalid AI response.", e);
        }
    }

    public record DocumentAnalysis(
            String classification,
            Map<String, String> extractedFields,
            String summary,
            List<String> tasks
    ) {}
}
