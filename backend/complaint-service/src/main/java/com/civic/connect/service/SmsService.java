package com.civic.connect.service;

import com.civic.connect.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    @Async
    public void sendSms(User recipient, String messageText) {
        if (recipient == null || recipient.getMobile() == null || recipient.getMobile().trim().isEmpty()) {
            log.warn("Cannot send SMS: Recipient or phone number is missing");
            return;
        }

        if (Boolean.FALSE.equals(recipient.getSmsNotificationsEnabled())) {
            log.info("SMS notification skipped for user {}: Disabled in user preferences", recipient.getMobile());
            return;
        }

        sendSmsToNumber(recipient.getMobile(), messageText);
    }

    @Async
    public void sendSmsToNumber(String mobile, String messageText) {
        if (mobile == null || mobile.trim().isEmpty()) return;
        log.info("[SMS SKIPPED - SMS OTP Disabled, Email Verification Active]: To: {}", mobile);
    }
}
