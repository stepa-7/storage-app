package com.notification.repository;

import com.notification.model.entity.NotificationRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationRule, UUID> {
    List<NotificationRule> getByStorageId(UUID storageId);

    Boolean existsByStorageId(UUID storageId);
}
