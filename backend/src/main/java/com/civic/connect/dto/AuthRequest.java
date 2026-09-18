package com.civic.connect.dto;

public class AuthRequest {
    private String email;
    private String usernameOrEmail;
    private String username;
    private String password;

    public AuthRequest() {}

    public AuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        if (email != null && !email.trim().isEmpty()) return email;
        if (usernameOrEmail != null && !usernameOrEmail.trim().isEmpty()) return usernameOrEmail;
        if (username != null && !username.trim().isEmpty()) return username;
        return null;
    }

    public void setEmail(String email) { this.email = email; }

    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
