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

/**
 * Analyzes documents via Groq's OpenAI-compatible chat completions API
 * (default model: Llama 3.3 70B), used as a free, no-credit-card alternative
 * to paid AI providers.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class GroqAiAnalyzer implements DocumentAiAnalyzer {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    @Value("${groq.max-tokens:2048}")
    private int maxTokens;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public DocumentAnalysis analyzeDocument(String text, String filename) {
        String prompt = AiPromptBuilder.buildDocumentAnalysisPrompt(text, filename);

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );
            String content = extractContent(response.getBody());
            return AiAnalysisParser.parse(objectMapper, content);
        } catch (Exception e) {
            log.error("Groq API error for '{}': {}", filename, e.getMessage());
            throw new RuntimeException("AI analysis failed: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> body) {
        List<Map<String, Object>> choices =
                (List<Map<String, Object>>) body.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("Empty Groq API response.");
        }
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }
}
