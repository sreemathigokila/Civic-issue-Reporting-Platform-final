package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 20)
    private String mobile;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private District district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(length = 50)
    private String workerIdCode;

    @Column(length = 20)
    private String aadharId;

    @Column(length = 100)
    private String designation;

    public User() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final User u = new User();
        public Builder fullName(String val) { u.fullName = val; return this; }
        public Builder email(String val) { u.email = val; return this; }
        public Builder password(String val) { u.password = val; return this; }
        public Builder mobile(String val) { u.mobile = val; return this; }
        public Builder role(Role val) { u.role = val; return this; }
        public Builder district(District val) { u.district = val; return this; }
        public Builder department(Department val) { u.department = val; return this; }
        public Builder workerIdCode(String val) { u.workerIdCode = val; return this; }
        public Builder aadharId(String val) { u.aadharId = val; return this; }
        public Builder designation(String val) { u.designation = val; return this; }
        public User build() { return u; }
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public String getWorkerIdCode() { return workerIdCode; }
    public void setWorkerIdCode(String workerIdCode) { this.workerIdCode = workerIdCode; }

    public String getAadharId() { return aadharId; }
    public void setAadharId(String aadharId) { this.aadharId = aadharId; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
}
