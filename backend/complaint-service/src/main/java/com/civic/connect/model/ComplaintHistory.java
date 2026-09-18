package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "complaint_history")
public class ComplaintHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 50)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id")
    private User changedBy;

    @Column(length = 500)
    private String remarks;

    public ComplaintHistory() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ComplaintHistory h = new ComplaintHistory();
        public Builder complaint(Complaint val) { h.complaint = val; return this; }
        public Builder action(String val) { h.action = val; return this; }
        public Builder status(String val) { h.status = val; return this; }
        public Builder changedBy(User val) { h.changedBy = val; return this; }
        public Builder remarks(String val) { h.remarks = val; return this; }
        public ComplaintHistory build() { return h; }
    }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
