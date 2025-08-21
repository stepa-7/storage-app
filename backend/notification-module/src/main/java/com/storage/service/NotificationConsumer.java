package com.storage.service;

import com.storage.model.StorageIsFullEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.client.RestTemplate;

public class NotificationConsumer {

    private final RestTemplate restTemplate = new RestTemplate();
    private KafkaTemplate<String, String> kafkaTemplate;

    @KafkaListener(topics = "storage-notification", groupId = "notification-module")
    public void onMessage(StorageIsFullEvent event) {
        if (event.getUsed().equals(event.getSize())) {
            String msg = "Storage " + event.getStorageUuid() + " " + event.getStorageName() + " is full";

            kafkaTemplate.send("user-notification", msg);
        }
    }
}
