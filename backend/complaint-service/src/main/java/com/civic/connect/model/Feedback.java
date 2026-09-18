package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "feedback")
public class Feedback extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 500)
    private String comments;

    public Feedback() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Feedback f = new Feedback();
        public Builder complaint(Complaint val) { f.complaint = val; return this; }
        public Builder citizen(User val) { f.citizen = val; return this; }
        public Builder rating(Integer val) { f.rating = val; return this; }
        public Builder comments(String val) { f.comments = val; return this; }
        public Feedback build() { return f; }
    }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public User getCitizen() { return citizen; }
    public void setCitizen(User citizen) { this.citizen = citizen; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
