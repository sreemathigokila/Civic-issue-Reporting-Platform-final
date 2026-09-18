package com.civic.connect.dto;

public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String mobile;
    private String role;
    private String state;
    private String district;
    private String city;
    private String address;
    private String pincode;
    private String location;
    private String workerIdCode;
    private String designation;
    private String department;

    public UserResponse() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final UserResponse u = new UserResponse();
        public Builder id(Long val) { u.id = val; return this; }
        public Builder fullName(String val) { u.fullName = val; return this; }
        public Builder email(String val) { u.email = val; return this; }
        public Builder mobile(String val) { u.mobile = val; return this; }
        public Builder role(String val) { u.role = val; return this; }
        public Builder state(String val) { u.state = val; return this; }
        public Builder district(String val) { u.district = val; return this; }
        public Builder city(String val) { u.city = val; return this; }
        public Builder address(String val) { u.address = val; return this; }
        public Builder pincode(String val) { u.pincode = val; return this; }
        public Builder location(String val) { u.location = val; return this; }
        public Builder workerIdCode(String val) { u.workerIdCode = val; return this; }
        public Builder designation(String val) { u.designation = val; return this; }
        public Builder department(String val) { u.department = val; return this; }
        public UserResponse build() { return u; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWorkerIdCode() { return workerIdCode; }
    public void setWorkerIdCode(String workerIdCode) { this.workerIdCode = workerIdCode; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
