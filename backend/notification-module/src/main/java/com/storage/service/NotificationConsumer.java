package com.storage.service;

import com.storage.model.notification.StorageData;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final NotificationService notificationService;

    @KafkaListener(topics = "storage-notification", groupId = "notification-module")
    public void onMessage(StorageData event) {
        //System.out.println(event);

        Optional<String> msg = notificationService.checkRule(event);
        msg.ifPresent(s -> kafkaTemplate.send("user-notification", s));
    }
}
