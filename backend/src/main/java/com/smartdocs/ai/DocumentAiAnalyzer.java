package com.smartdocs.ai;

import java.util.List;
import java.util.Map;

public interface DocumentAiAnalyzer {

    DocumentAnalysis analyzeDocument(String text, String filename);

    record DocumentAnalysis(
            String classification,
            Map<String, String> extractedFields,
            String summary,
            List<String> tasks
    ) {}
}
