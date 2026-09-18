package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    public Role() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Role r = new Role();
        public Builder name(String val) { r.name = val; return this; }
        public Role build() { return r; }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
