package com.civic.connect.service;

import com.civic.connect.dto.PriorityClassificationResult;
import com.civic.connect.model.Complaint;
import com.civic.connect.model.ComplaintPriority;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Service
public class PriorityClassificationService {

    @Value("${spring.ai.openai.api-key:${SPRING_AI_OPENAI_API_KEY:}}")
    private String apiKey;

    @Value("${spring.ai.openai.model:gpt-3.5-turbo}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    /**
     * Main classification method: Analyzes a complaint using LLM prompt or fallback heuristics.
     */
    public PriorityClassificationResult classifyPriority(Complaint complaint) {
        if (complaint == null) {
            return new PriorityClassificationResult("MEDIUM", 0.80, "Default fallback for null complaint");
        }

        String title = complaint.getTitle() != null ? complaint.getTitle() : "";
        String description = complaint.getDescription() != null ? complaint.getDescription() : "";
        String category = complaint.getCategory() != null ? complaint.getCategory() : "";
        String locationAddress = complaint.getLocationAddress() != null ? complaint.getLocationAddress() : "";
        String districtName = complaint.getDistrict() != null ? complaint.getDistrict().getName() : "";

        // If OpenAI API key is configured, call LLM
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.contains("YOUR_API_KEY")) {
            try {
                PriorityClassificationResult llmResult = callLlmClassification(title, description, category, locationAddress, districtName);
                if (llmResult != null && isValidPriority(llmResult.getPriority())) {
                    return llmResult;
                }
            } catch (Exception e) {
                System.err.println("Spring AI / OpenAI priority classification failed, using fallback: " + e.getMessage());
            }
        }

        // Safe Fallback Priority Classifier (Rule-based heuristics)
        return classifyFallback(title, description, category);
    }

    private PriorityClassificationResult callLlmClassification(String title, String description, String category, String locationAddress, String districtName) throws Exception {
        String promptText = buildLlmPrompt(title, description, category, locationAddress, districtName);

        String jsonPayload = objectMapper.writeValueAsString(java.util.Map.of(
                "model", modelName,
                "messages", List.of(
                        java.util.Map.of("role", "system", "content", getSystemInstruction()),
                        java.util.Map.of("role", "user", "content", promptText)
                ),
                "temperature", 0.2
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(6))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").get(0).path("message").path("content").asText();
            
            // Extract JSON from response text
            int jsonStart = content.indexOf("{");
            int jsonEnd = content.lastIndexOf("}");
            if (jsonStart != -1 && jsonEnd != -1) {
                content = content.substring(jsonStart, jsonEnd + 1);
            }

            JsonNode resJson = objectMapper.readTree(content);
            String priorityStr = resJson.path("priority").asText("MEDIUM").toUpperCase();
            double confidence = resJson.path("confidence").asDouble(0.90);
            String reason = resJson.path("reason").asText("Classified via LLM Spring AI Service");

            ComplaintPriority priorityEnum = ComplaintPriority.fromString(priorityStr);

            return new PriorityClassificationResult(priorityEnum.name(), confidence, reason);
        } else {
            System.err.println("OpenAI API returned non-200 status code: " + response.statusCode() + " -> " + response.body());
        }

        return null;
    }

    private String getSystemInstruction() {
        return "You are a civic issue priority classification assistant for the CivicConnect platform.\n" +
                "Analyze the complaint and assign EXACTLY ONE priority level: HIGH, MEDIUM, or LOW.\n\n" +
                "HIGH means the issue has serious public safety, health, environmental, infrastructure, or widespread community impact and requires urgent attention.\n" +
                "MEDIUM means the issue has meaningful public impact but does not represent an immediate serious danger.\n" +
                "LOW means the issue is minor, routine, or can reasonably wait without significant public harm.\n\n" +
                "Consider: severity, urgency, public safety, health risk, environmental impact, number of people affected, infrastructure impact, and potential consequences of delay.\n\n" +
                "Return ONLY a valid JSON object with the exact format:\n" +
                "{\n" +
                "  \"priority\": \"HIGH\"|\"MEDIUM\"|\"LOW\",\n" +
                "  \"confidence\": 0.95,\n" +
                "  \"reason\": \"Short explanation of priority classification\"\n" +
                "}";
    }

    private String buildLlmPrompt(String title, String description, String category, String locationAddress, String districtName) {
        return "Complaint Details to Classify:\n" +
                "- Title: " + title + "\n" +
                "- Description: " + description + "\n" +
                "- Category: " + category + "\n" +
                "- Location: " + locationAddress + "\n" +
                "- District: " + districtName + "\n\n" +
                "Assign exactly one priority (HIGH, MEDIUM, or LOW) and return JSON.";
    }

    private boolean isValidPriority(String priority) {
        if (priority == null) return false;
        String p = priority.trim().toUpperCase();
        return "HIGH".equals(p) || "MEDIUM".equals(p) || "LOW".equals(p);
    }

    private PriorityClassificationResult classifyFallback(String title, String description, String category) {
        String text = (title + " " + description + " " + category).toLowerCase();

        String priority = "MEDIUM";
        String reason = "Assigned standard priority based on civic issue parameters";
        double confidence = 0.88;

        if (text.contains("pothole") || text.contains("live wire") || text.contains("electric wire") ||
            text.contains("flooding") || text.contains("burst") || text.contains("manhole") ||
            text.contains("danger") || text.contains("accident") || text.contains("sewage near school") ||
            text.contains("hospital") || text.contains("collapsed")) {
            priority = "HIGH";
            reason = "High public safety or critical infrastructure risk detected";
            confidence = 0.94;
        } else if (text.contains("paint") || text.contains("signboard") || text.contains("litter") || text.contains("minor")) {
            priority = "LOW";
            reason = "Minor routine maintenance issue";
            confidence = 0.85;
        }

        return new PriorityClassificationResult(priority, confidence, reason);
    }
}
