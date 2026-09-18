package com.civic.connect.service;

import com.civic.connect.model.Notification;
import com.civic.connect.model.User;
import com.civic.connect.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationDispatcherService {

    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcherService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public NotificationDispatcherService(NotificationRepository notificationRepository,
                                         EmailService emailService,
                                         SmsService smsService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.smsService = smsService;
    }

    public void dispatch(User recipient, String title, String message, String type, Long complaintId) {
        if (recipient == null) {
            log.warn("Cannot dispatch notification: Recipient user is null");
            return;
        }

        // 1. Push / In-App Channel
        if (Boolean.TRUE.equals(recipient.getPushNotificationsEnabled())) {
            try {
                Notification n = Notification.builder()
                        .user(recipient)
                        .title(title)
                        .message(message)
                        .type(type)
                        .complaintId(complaintId)
                        .readStatus(false)
                        .build();

                Notification saved = notificationRepository.save(n);
                log.info("Saved push notification ID {} for user {}", saved.getId(), recipient.getId());

                if (messagingTemplate != null) {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("id", saved.getId());
                    payload.put("userId", recipient.getId());
                    payload.put("title", title);
                    payload.put("message", message);
                    payload.put("type", type);
                    payload.put("complaintId", complaintId);
                    payload.put("createdAt", saved.getCreatedAt());

                    messagingTemplate.convertAndSend("/topic/notifications/" + recipient.getId(), payload);
                    messagingTemplate.convertAndSend("/topic/notifications", payload);
                }
            } catch (Exception e) {
                log.error("Failed to persist or broadcast in-app push notification for user {}: {}", recipient.getId(), e.getMessage());
            }
        }

        // 2. Email Channel
        if (Boolean.TRUE.equals(recipient.getEmailNotificationsEnabled())) {
            String subject = "[CivicConnect] " + title;
            String body = "Hello " + (recipient.getFullName() != null ? recipient.getFullName() : "User") + ",\n\n"
                    + message + "\n\n"
                    + (complaintId != null ? "Complaint ID: C-" + complaintId + "\n" : "")
                    + "Thank you,\nCivicConnect Platform";
            emailService.sendEmail(recipient, subject, body);
        }

        // 3. SMS Channel
        if (Boolean.TRUE.equals(recipient.getSmsNotificationsEnabled())) {
            String smsText = "CivicConnect Alert: " + title + " - " + message;
            smsService.sendSms(recipient, smsText);
        }
    }
}
