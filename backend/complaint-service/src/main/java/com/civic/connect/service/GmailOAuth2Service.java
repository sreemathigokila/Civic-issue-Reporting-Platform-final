package com.civic.connect.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class GmailOAuth2Service {

    private static final Logger log = LoggerFactory.getLogger(GmailOAuth2Service.class);

    @Value("${google.oauth2.refresh-token:${GOOGLE_OAUTH2_REFRESH_TOKEN:}}")
    private String refreshToken;

    @Value("${google.oauth2.sender-email:${GOOGLE_OAUTH2_SENDER_EMAIL:sreemathigokila@gmail.com}}")
    private String senderEmail;

    @Value("${google.oauth2.sender-name:CivicConnect}")
    private String senderName;

    private String clientId;
    private String clientSecret;
    private String tokenUri = "https://oauth2.googleapis.com/token";

    private String cachedAccessToken;
    private long accessTokenExpiryTime = 0;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("google-oauth-client.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    JsonNode root = objectMapper.readTree(is);
                    JsonNode webNode = root.has("web") ? root.get("web") : root.get("installed");
                    if (webNode != null) {
                        if (webNode.has("client_id")) {
                            this.clientId = webNode.get("client_id").asText();
                        }
                        if (webNode.has("client_secret")) {
                            this.clientSecret = webNode.get("client_secret").asText();
                        }
                        if (webNode.has("token_uri")) {
                            this.tokenUri = webNode.get("token_uri").asText();
                        }
                    }
                }
                log.info("Successfully initialized Google OAuth2 configuration from google-oauth-client.json");
            } else {
                log.warn("google-oauth-client.json resource file not found on classpath");
            }
        } catch (Exception e) {
            log.error("Failed to load google-oauth-client.json: {}", e.getMessage());
        }
    }

    public synchronized String getAccessToken() {
        if (cachedAccessToken != null && System.currentTimeMillis() < accessTokenExpiryTime - 60000) {
            return cachedAccessToken;
        }

        String cleanRefreshToken = refreshToken != null ? refreshToken.trim() : "";
        if (cleanRefreshToken.isEmpty() || clientId == null || clientSecret == null) {
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("client_id", clientId);
            map.add("client_secret", clientSecret);
            map.add("refresh_token", cleanRefreshToken);
            map.add("grant_type", "refresh_token");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUri, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                if (json.has("access_token")) {
                    this.cachedAccessToken = json.get("access_token").asText();
                    int expiresIn = json.has("expires_in") ? json.get("expires_in").asInt() : 3600;
                    this.accessTokenExpiryTime = System.currentTimeMillis() + (expiresIn * 1000L);
                    log.info("Google OAuth2 access token successfully refreshed");
                    return this.cachedAccessToken;
                }
            }
        } catch (Exception e) {
            log.error("Failed to refresh Google OAuth2 access token: {}", e.getMessage());
        }
        return null;
    }

    public boolean isOAuth2Configured() {
        return clientId != null && !clientId.isEmpty() 
            && clientSecret != null && !clientSecret.isEmpty() 
            && refreshToken != null && !refreshToken.trim().isEmpty();
    }

    public void sendEmailOtp(String toEmail, String otpCode) {
        String subject = "CivicConnect Email Verification OTP";
        String htmlContent = "<html><body style='font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;'>"
                + "<div style='max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #f3e8ff; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>"
                + "<h2 style='color: #6b21a8; margin-top: 0;'>CivicConnect OTP Verification</h2>"
                + "<p style='color: #4b5563; font-size: 15px;'>Use the following 6-digit One-Time Password (OTP) to complete your email verification:</p>"
                + "<div style='background-color: #f3e8ff; border-radius: 12px; padding: 15px; margin: 20px 0; display: inline-block; text-align: center; width: 80%;'>"
                + "<span style='font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; font-family: monospace;'>" + otpCode + "</span>"
                + "</div>"
                + "<p style='color: #6b7280; font-size: 12px; margin-bottom: 0;'>This OTP is valid for 5 minutes. Please do not share this code with anyone.</p>"
                + "</div></body></html>";

        sendEmailHtml(toEmail, subject, htmlContent);
    }

    public void sendEmailHtml(String toEmail, String subject, String htmlContent) {
        String token = getAccessToken();

        if (token == null) {
            log.warn("[GMAIL OAUTH2 DEMO MODE - Refresh token unconfigured/invalid]: Email OTP for {} dispatch simulation active", toEmail);
            return;
        }

        try {
            String mimeString = "From: " + senderName + " <" + senderEmail + ">\r\n"
                    + "To: " + toEmail + "\r\n"
                    + "Subject: " + subject + "\r\n"
                    + "MIME-Version: 1.0\r\n"
                    + "Content-Type: text/html; charset=UTF-8\r\n\r\n"
                    + htmlContent;

            String encodedMime = Base64.getUrlEncoder().withoutPadding().encodeToString(mimeString.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            Map<String, String> body = new HashMap<>();
            body.put("raw", encodedMime);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GMAIL_SEND_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email OTP successfully sent via Gmail OAuth2 API to {}", toEmail);
            } else {
                log.error("Gmail OAuth2 API returned status: {}", response.getStatusCode());
            }
        } catch (HttpClientErrorException.Unauthorized e) {
            log.error("Gmail OAuth2 authorization failed (401). Clearing cached access token.");
            this.cachedAccessToken = null;
            throw new RuntimeException("Gmail OAuth2 Authentication Failed. Please verify your Google OAuth2 Refresh Token.");
        } catch (Exception e) {
            log.error("Failed to send email via Gmail OAuth2 API to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email via Gmail OAuth2: " + e.getMessage());
        }
    }
}
