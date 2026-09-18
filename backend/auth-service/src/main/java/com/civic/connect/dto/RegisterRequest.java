package com.civic.connect.dto;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String mobile;
    private String role;
    private String state;
    private String district;
    private String city;
    private String location;
    private String workerIdCode;
    private String designation;
    private String aadharId;
    private Long departmentId;
    private Long districtId;
    private String pincode;

    public RegisterRequest() {}

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

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

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWorkerIdCode() { return workerIdCode; }
    public void setWorkerIdCode(String workerIdCode) { this.workerIdCode = workerIdCode; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getAadharId() { return aadharId; }
    public void setAadharId(String aadharId) { this.aadharId = aadharId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getDistrictId() { return districtId; }
    public void setDistrictId(Long districtId) { this.districtId = districtId; }
}
