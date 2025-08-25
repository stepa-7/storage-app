package com.notification.service;

import com.storage.model.notification.StorageData;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @KafkaListener(topics = "storage-notification", groupId = "notification-module")
    public void onMessage(StorageData event) {
        List<String> messages = notificationService.checkRule(event);

        for (String msg : messages) {
            kafkaTemplate.send("user-notification", msg);
            String email = event.getUserEmail();
            emailService.sendEmail(email, "Storage Alert", msg);
        }
    }
}
