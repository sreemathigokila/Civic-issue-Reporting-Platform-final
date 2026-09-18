package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "citizens")
public class Citizen extends BaseEntity {

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 250)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String pincode;

    public Citizen() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Citizen c = new Citizen();
        public Builder user(User val) { c.user = val; return this; }
        public Builder address(String val) { c.address = val; return this; }
        public Builder city(String val) { c.city = val; return this; }
        public Builder state(String val) { c.state = val; return this; }
        public Builder pincode(String val) { c.pincode = val; return this; }
        public Citizen build() { return c; }
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
}
