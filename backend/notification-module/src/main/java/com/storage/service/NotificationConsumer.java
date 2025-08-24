package com.storage.service;

import com.storage.model.StorageData;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Optional;

public class NotificationConsumer {

    private KafkaTemplate<String, String> kafkaTemplate;
    private NotificationService notificationService;

    @KafkaListener(topics = "storage-notification", groupId = "notification-module")
    public void onMessage(StorageData event) {
        //System.out.println(event);

        Optional<String> msg = notificationService.checkRule(event);
        if(msg.isPresent()){
            kafkaTemplate.send("user-notification", msg.get());
        }
    }
}
