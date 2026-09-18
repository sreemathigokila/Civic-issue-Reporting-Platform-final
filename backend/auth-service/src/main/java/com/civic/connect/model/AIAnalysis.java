package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ai_analysis")
public class AIAnalysis extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(name = "detected_issue", length = 200)
    private String detectedIssue;

    @Column(name = "detected_department", length = 100)
    private String detectedDepartment;

    @Column(columnDefinition = "CLOB")
    private String summary;

    @Column(length = 300)
    private String keywords;

    @Column(name = "assigned_priority", length = 50)
    private String assignedPriority;

    @Column(name = "urgency_level", length = 50)
    private String urgencyLevel;

    @Column(name = "recommended_category", length = 100)
    private String recommendedCategory;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "raw_response", columnDefinition = "CLOB")
    private String rawResponse;

    public AIAnalysis() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AIAnalysis a = new AIAnalysis();
        public Builder complaint(Complaint val) { a.complaint = val; return this; }
        public Builder detectedIssue(String val) { a.detectedIssue = val; return this; }
        public Builder detectedDepartment(String val) { a.detectedDepartment = val; return this; }
        public Builder summary(String val) { a.summary = val; return this; }
        public Builder keywords(String val) { a.keywords = val; return this; }
        public Builder assignedPriority(String val) { a.assignedPriority = val; return this; }
        public Builder urgencyLevel(String val) { a.urgencyLevel = val; return this; }
        public Builder recommendedCategory(String val) { a.recommendedCategory = val; return this; }
        public Builder confidenceScore(Double val) { a.confidenceScore = val; return this; }
        public Builder rawResponse(String val) { a.rawResponse = val; return this; }
        public AIAnalysis build() { return a; }
    }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public String getDetectedIssue() { return detectedIssue; }
    public void setDetectedIssue(String detectedIssue) { this.detectedIssue = detectedIssue; }

    public String getDetectedDepartment() { return detectedDepartment; }
    public void setDetectedDepartment(String detectedDepartment) { this.detectedDepartment = detectedDepartment; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getAssignedPriority() { return assignedPriority; }
    public void setAssignedPriority(String assignedPriority) { this.assignedPriority = assignedPriority; }

    public String getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(String urgencyLevel) { this.urgencyLevel = urgencyLevel; }

    public String getRecommendedCategory() { return recommendedCategory; }
    public void setRecommendedCategory(String recommendedCategory) { this.recommendedCategory = recommendedCategory; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getRawResponse() { return rawResponse; }
    public void setRawResponse(String rawResponse) { this.rawResponse = rawResponse; }
}
