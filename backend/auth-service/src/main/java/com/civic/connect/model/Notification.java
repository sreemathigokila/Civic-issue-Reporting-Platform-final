package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 50)
    private String type;

    @Column(name = "read_status", nullable = false)
    private Boolean readStatus = false;

    public Notification() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Notification n = new Notification();
        public Builder user(User val) { n.user = val; return this; }
        public Builder title(String val) { n.title = val; return this; }
        public Builder message(String val) { n.message = val; return this; }
        public Builder type(String val) { n.type = val; return this; }
        public Builder readStatus(Boolean val) { n.readStatus = val; return this; }
        public Notification build() { return n; }
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Boolean getReadStatus() { return readStatus; }
    public void setReadStatus(Boolean readStatus) { this.readStatus = readStatus; }
}
