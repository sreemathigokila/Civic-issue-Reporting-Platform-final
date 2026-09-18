package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "department_heads", uniqueConstraints = {
    @UniqueConstraint(name = "uk_district_department", columnNames = {"district_id", "department_id"})
})
public class DepartmentHead extends BaseEntity {

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    public DepartmentHead() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DepartmentHead dh = new DepartmentHead();
        public Builder user(User val) { dh.user = val; return this; }
        public Builder district(District val) { dh.district = val; return this; }
        public Builder department(Department val) { dh.department = val; return this; }
        public DepartmentHead build() { return dh; }
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
}
