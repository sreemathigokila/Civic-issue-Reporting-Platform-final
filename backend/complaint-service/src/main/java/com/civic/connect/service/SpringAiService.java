package com.civic.connect.service;

import com.civic.connect.dto.PriorityClassificationResult;
import com.civic.connect.model.AIAnalysis;
import com.civic.connect.model.Complaint;
import org.springframework.stereotype.Service;

@Service
public class SpringAiService {

    private final PriorityClassificationService priorityClassificationService;

    public SpringAiService(PriorityClassificationService priorityClassificationService) {
        this.priorityClassificationService = priorityClassificationService;
    }

    /**
     * Performs AI analysis on complaint title, description, category, and location.
     * Uses LLM PriorityClassificationService to assign structured priority (HIGH, MEDIUM, LOW).
     */
    public AIAnalysis analyzeComplaint(Complaint complaint) {
        String category = complaint.getCategory() != null ? complaint.getCategory() : "General";

        // LLM Priority Classification
        PriorityClassificationResult priorityResult = priorityClassificationService.classifyPriority(complaint);

        String priority = priorityResult.getPriority();
        double confidence = priorityResult.getConfidence();
        String urgency = "HIGH".equals(priority) ? "HIGH" : ("LOW".equals(priority) ? "LOW" : "NORMAL");

        String summary = "AI Summary: " + complaint.getTitle() + " reported at " + complaint.getLocationAddress() + ". Priority: " + priority + ". Reason: " + priorityResult.getReason();
        String keywords = category + ", civic-issue, " + (complaint.getLocationAddress() != null ? complaint.getLocationAddress() : "locality");

        return AIAnalysis.builder()
                .complaint(complaint)
                .detectedIssue(complaint.getTitle())
                .detectedDepartment(category)
                .summary(summary)
                .keywords(keywords)
                .assignedPriority(priority)
                .urgencyLevel(urgency)
                .recommendedCategory(category)
                .confidenceScore(confidence)
                .rawResponse("{\"status\":\"success\", \"engine\":\"SpringAI-OpenAI\", \"priority\":\"" + priority + "\", \"reason\":\"" + priorityResult.getReason().replace("\"", "'") + "\", \"confidence\":" + confidence + "}")
                .build();
    }
}

