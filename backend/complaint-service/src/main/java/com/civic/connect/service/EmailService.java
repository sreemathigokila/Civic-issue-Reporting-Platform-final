package com.civic.connect.service;

import com.civic.connect.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private GmailOAuth2Service gmailOAuth2Service;

    @Async
    public void sendEmail(User recipient, String subject, String body) {
        if (recipient == null || recipient.getEmail() == null) {
            log.warn("Cannot send email: Recipient or email address is null");
            return;
        }

        if (Boolean.FALSE.equals(recipient.getEmailNotificationsEnabled())) {
            log.info("Email notification skipped for user {}: Disabled by user preferences", recipient.getEmail());
            return;
        }

        sendEmailToAddress(recipient.getEmail(), subject, body);
    }

    @Async
    public void sendEmailToAddress(String email, String subject, String body) {
        if (email == null || email.trim().isEmpty()) return;
        try {
            gmailOAuth2Service.sendEmailHtml(email, subject, body);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", email, e.getMessage());
        }
    }
}
