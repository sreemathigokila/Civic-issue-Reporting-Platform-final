package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "entity_name", length = 100)
    private String entityName;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(columnDefinition = "CLOB")
    private String details;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    public AuditLog() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AuditLog a = new AuditLog();
        public Builder user(User val) { a.user = val; return this; }
        public Builder action(String val) { a.action = val; return this; }
        public Builder entityName(String val) { a.entityName = val; return this; }
        public Builder entityId(Long val) { a.entityId = val; return this; }
        public Builder details(String val) { a.details = val; return this; }
        public Builder ipAddress(String val) { a.ipAddress = val; return this; }
        public AuditLog build() { return a; }
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
