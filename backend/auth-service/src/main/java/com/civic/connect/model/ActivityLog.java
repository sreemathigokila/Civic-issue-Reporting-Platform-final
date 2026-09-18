package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "activity_logs")
public class ActivityLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 300)
    private String description;

    @Column(name = "activity_type", length = 50)
    private String activityType;

    public ActivityLog() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ActivityLog a = new ActivityLog();
        public Builder user(User val) { a.user = val; return this; }
        public Builder description(String val) { a.description = val; return this; }
        public Builder activityType(String val) { a.activityType = val; return this; }
        public ActivityLog build() { return a; }
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }
}
