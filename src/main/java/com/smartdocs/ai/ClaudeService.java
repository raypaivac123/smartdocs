package com.smartdocs.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
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
                "model",      model,
                "max_tokens", maxTokens,
                "messages",   List.of(Map.of("role", "user", "content", prompt))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );
            String content = extractContent(response.getBody());
            return parseAnalysis(content);

        } catch (Exception e) {
            log.error("Erro na API Claude para '{}': {}", filename, e.getMessage());
            throw new RuntimeException("KI-Analyse fehlgeschlagen: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(String text, String filename) {
        return """
            Du bist ein KI-Assistent für deutsche Geschäftsdokumente.
            Analysiere das folgende Dokument und antworte NUR mit einem JSON-Objekt.
            Kein Markdown, kein Text davor oder danach.

            Dateiname: %s

            Dokumentinhalt:
            ---
            %s
            ---

            Antworte mit exakt diesem JSON:
            {
              "classification": "VERTRAG|RECHNUNG|ANTRAG|BERICHT|RECHTSSCHREIBEN",
              "extractedFields": {
                "FeldName": "Wert"
              },
              "summary": "Kurze Zusammenfassung auf Deutsch (2-3 Sätze)",
              "tasks": ["Aufgabe 1", "Aufgabe 2"]
            }

            Regeln:
            - classification: escolha o tipo mais adequado
            - extractedFields: 4-8 campos importantes do documento
            - summary: preciso e profissional, em alemão
            - tasks: 1-3 ações concretas que surgem do documento
            - Responda APENAS com JSON válido
            """.formatted(filename,
                text.substring(0, Math.min(text.length(), 8000)));
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> body) {
        List<Map<String, Object>> content =
                (List<Map<String, Object>>) body.get("content");
        if (content == null || content.isEmpty())
            throw new RuntimeException("Resposta vazia da API Claude.");
        return (String) content.get(0).get("text");
    }

    @SuppressWarnings("unchecked")
    private DocumentAnalysis parseAnalysis(String json) {
        try {
            Map<String, Object> parsed =
                    objectMapper.readValue(json, Map.class);
            return new DocumentAnalysis(
                    (String)              parsed.get("classification"),
                    (Map<String, String>) parsed.get("extractedFields"),
                    (String)              parsed.get("summary"),
                    (List<String>)        parsed.get("tasks")
            );
        } catch (Exception e) {
            log.error("Erro ao parsear resposta Claude: {}", json);
            throw new RuntimeException(
                    "Resposta da IA inválida.", e);
        }
    }

    public record DocumentAnalysis(
            String              classification,
            Map<String, String> extractedFields,
            String              summary,
            List<String>        tasks
    ) {}
}