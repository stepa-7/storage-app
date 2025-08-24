package com.storage.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic storageNotificationTopic() {
        return TopicBuilder.name("storage-notification")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userNotificationTopic() {
        return TopicBuilder.name("user-notification")
                .partitions(1)
                .replicas(1)
                .build();
    }
}