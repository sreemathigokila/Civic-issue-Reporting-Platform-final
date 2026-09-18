package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "districts")
public class District extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 20)
    private String code;

    @Column(length = 100)
    private String state;

    public District() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final District d = new District();
        public Builder name(String val) { d.name = val; return this; }
        public Builder code(String val) { d.code = val; return this; }
        public Builder state(String val) { d.state = val; return this; }
        public District build() { return d; }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}
