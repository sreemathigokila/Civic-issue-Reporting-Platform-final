package com.civic.connect.dto;

public class PriorityClassificationResult {
    private String priority;
    private double confidence;
    private String reason;

    public PriorityClassificationResult() {}

    public PriorityClassificationResult(String priority, double confidence, String reason) {
        this.priority = priority;
        this.confidence = confidence;
        this.reason = reason;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
