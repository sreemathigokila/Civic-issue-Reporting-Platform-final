package com.civic.connect.dto;

public class UpdateProfileRequest {
    private String fullName;
    private String mobile;
    private String address;
    private String city;
    private String state;
    private String pincode;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String fullName, String mobile, String address, String city, String state, String pincode) {
        this.fullName = fullName;
        this.mobile = mobile;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
}
