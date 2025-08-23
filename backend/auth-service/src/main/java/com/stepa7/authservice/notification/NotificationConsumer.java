//package com.stepa7.authservice.notification;
//
//import com.stepa7.authservice.user.UserRepository;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.stereotype.Service;
//
//@Service
//public class NotificationConsumer {
//
//    private EmailService emailService;
//
//    @KafkaListener(topics = "user-notification", groupId = "notification-module")
//    public void onMessage(String event) {
//        emailService.sendBulkEmail("Storage notification", event);
//    }
//}
