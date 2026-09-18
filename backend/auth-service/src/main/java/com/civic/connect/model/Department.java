package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 20)
    private String code;

    @Column(length = 500)
    private String description;

    public Department() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Department d = new Department();
        public Builder name(String val) { d.name = val; return this; }
        public Builder code(String val) { d.code = val; return this; }
        public Builder description(String val) { d.description = val; return this; }
        public Department build() { return d; }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
