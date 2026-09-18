package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "worker")
public class Worker extends BaseEntity {

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "worker_id_code", nullable = false, unique = true, length = 50)
    private String workerIdCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id")
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(length = 100)
    private String designation;

    @Column(name = "aadhar_id", length = 20)
    private String aadharId;

    public Worker() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Worker w = new Worker();
        public Builder user(User val) { w.user = val; return this; }
        public Builder workerIdCode(String val) { w.workerIdCode = val; return this; }
        public Builder district(District val) { w.district = val; return this; }
        public Builder department(Department val) { w.department = val; return this; }
        public Builder designation(String val) { w.designation = val; return this; }
        public Builder aadharId(String val) { w.aadharId = val; return this; }
        public Worker build() { return w; }
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getWorkerIdCode() { return workerIdCode; }
    public void setWorkerIdCode(String workerIdCode) { this.workerIdCode = workerIdCode; }

    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getAadharId() { return aadharId; }
    public void setAadharId(String aadharId) { this.aadharId = aadharId; }
}
