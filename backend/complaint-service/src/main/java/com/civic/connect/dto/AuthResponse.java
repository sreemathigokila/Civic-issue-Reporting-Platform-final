package com.civic.connect.dto;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private UserResponse user;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, UserResponse user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AuthResponse a = new AuthResponse();
        public Builder token(String val) { a.token = val; return this; }
        public Builder refreshToken(String val) { a.refreshToken = val; return this; }
        public Builder user(UserResponse val) { a.user = val; return this; }
        public AuthResponse build() { return a; }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }
}
