package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "complaints")
public class Complaint extends BaseEntity {

    @Column(name = "complaint_code", nullable = false, unique = true, length = 50)
    private String complaintCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id")
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_head_id")
    private DepartmentHead departmentHead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private Worker worker;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 4000)
    private String description;

    @Column(name = "voice_url", length = 500)
    private String voiceUrl;

    @Column(length = 100)
    private String category;

    @Column(length = 50)
    private String priority;

    @Column(length = 50)
    private String urgency;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "location_address", length = 300)
    private String locationAddress;

    private Double latitude;
    private Double longitude;

    @Column(name = "before_image_url", length = 4000)
    private String beforeImageUrl;

    @Column(name = "after_image_url", length = 4000)
    private String afterImageUrl;

    @Column(name = "final_remarks", length = 500)
    private String finalRemarks;

    @Column(name = "worker_remarks", length = 500)
    private String workerRemarks;

    public Complaint() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Complaint c = new Complaint();
        public Builder complaintCode(String val) { c.complaintCode = val; return this; }
        public Builder citizen(User val) { c.citizen = val; return this; }
        public Builder district(District val) { c.district = val; return this; }
        public Builder department(Department val) { c.department = val; return this; }
        public Builder departmentHead(DepartmentHead val) { c.departmentHead = val; return this; }
        public Builder worker(Worker val) { c.worker = val; return this; }
        public Builder title(String val) { c.title = val; return this; }
        public Builder description(String val) { c.description = val; return this; }
        public Builder voiceUrl(String val) { c.voiceUrl = val; return this; }
        public Builder category(String val) { c.category = val; return this; }
        public Builder priority(String val) { c.priority = val; return this; }
        public Builder urgency(String val) { c.urgency = val; return this; }
        public Builder status(String val) { c.status = val; return this; }
        public Builder locationAddress(String val) { c.locationAddress = val; return this; }
        public Builder latitude(Double val) { c.latitude = val; return this; }
        public Builder longitude(Double val) { c.longitude = val; return this; }
        public Builder beforeImageUrl(String val) { c.beforeImageUrl = val; return this; }
        public Builder afterImageUrl(String val) { c.afterImageUrl = val; return this; }
        public Builder finalRemarks(String val) { c.finalRemarks = val; return this; }
        public Builder workerRemarks(String val) { c.workerRemarks = val; return this; }
        public Complaint build() { return c; }
    }

    // Getters and Setters
    public String getComplaintCode() { return complaintCode; }
    public void setComplaintCode(String complaintCode) { this.complaintCode = complaintCode; }

    public User getCitizen() { return citizen; }
    public void setCitizen(User citizen) { this.citizen = citizen; }

    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public DepartmentHead getDepartmentHead() { return departmentHead; }
    public void setDepartmentHead(DepartmentHead departmentHead) { this.departmentHead = departmentHead; }

    public Worker getWorker() { return worker; }
    public void setWorker(Worker worker) { this.worker = worker; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVoiceUrl() { return voiceUrl; }
    public void setVoiceUrl(String voiceUrl) { this.voiceUrl = voiceUrl; }

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

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getBeforeImageUrl() { return beforeImageUrl; }
    public void setBeforeImageUrl(String beforeImageUrl) { this.beforeImageUrl = beforeImageUrl; }

    public String getAfterImageUrl() { return afterImageUrl; }
    public void setAfterImageUrl(String afterImageUrl) { this.afterImageUrl = afterImageUrl; }

    public String getFinalRemarks() { return finalRemarks; }
    public void setFinalRemarks(String finalRemarks) { this.finalRemarks = finalRemarks; }

    public String getWorkerRemarks() { return workerRemarks; }
    public void setWorkerRemarks(String workerRemarks) { this.workerRemarks = workerRemarks; }
}
