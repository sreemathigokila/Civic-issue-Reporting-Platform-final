package com.civic.connect.dto;

import java.time.LocalDateTime;

public class ComplaintResponse {
    private Long id;
    private String complaintNo;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String urgency;
    private String status;
    private String locationAddress;
    private String beforeImageUrl;
    private String afterImageUrl;
    private String finalRemarks;
    private String workerRemarks;
    private String citizenName;
    private String districtName;
    private String departmentName;
    private String departmentHeadName;
    private String workerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ComplaintResponse() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ComplaintResponse r = new ComplaintResponse();
        public Builder id(Long val) { r.id = val; return this; }
        public Builder complaintNo(String val) { r.complaintNo = val; return this; }
        public Builder title(String val) { r.title = val; return this; }
        public Builder description(String val) { r.description = val; return this; }
        public Builder category(String val) { r.category = val; return this; }
        public Builder priority(String val) { r.priority = val; return this; }
        public Builder urgency(String val) { r.urgency = val; return this; }
        public Builder status(String val) { r.status = val; return this; }
        public Builder locationAddress(String val) { r.locationAddress = val; return this; }
        public Builder beforeImageUrl(String val) { r.beforeImageUrl = val; return this; }
        public Builder afterImageUrl(String val) { r.afterImageUrl = val; return this; }
        public Builder finalRemarks(String val) { r.finalRemarks = val; return this; }
        public Builder workerRemarks(String val) { r.workerRemarks = val; return this; }
        public Builder citizenName(String val) { r.citizenName = val; return this; }
        public Builder districtName(String val) { r.districtName = val; return this; }
        public Builder departmentName(String val) { r.departmentName = val; return this; }
        public Builder departmentHeadName(String val) { r.departmentHeadName = val; return this; }
        public Builder workerName(String val) { r.workerName = val; return this; }
        public Builder createdAt(LocalDateTime val) { r.createdAt = val; return this; }
        public Builder updatedAt(LocalDateTime val) { r.updatedAt = val; return this; }
        public ComplaintResponse build() { return r; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getComplaintNo() { return complaintNo; }
    public void setComplaintNo(String complaintNo) { this.complaintNo = complaintNo; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public String getBeforeImageUrl() { return beforeImageUrl; }
    public void setBeforeImageUrl(String beforeImageUrl) { this.beforeImageUrl = beforeImageUrl; }

    public String getAfterImageUrl() { return afterImageUrl; }
    public void setAfterImageUrl(String afterImageUrl) { this.afterImageUrl = afterImageUrl; }

    public String getFinalRemarks() { return finalRemarks; }
    public void setFinalRemarks(String finalRemarks) { this.finalRemarks = finalRemarks; }

    public String getWorkerRemarks() { return workerRemarks; }
    public void setWorkerRemarks(String workerRemarks) { this.workerRemarks = workerRemarks; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentHeadName() { return departmentHeadName; }
    public void setDepartmentHeadName(String departmentHeadName) { this.departmentHeadName = departmentHeadName; }

    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
