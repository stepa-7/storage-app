package com.notification.service;

import com.notification.model.dto.NotificationRuleCreateDto;
import com.notification.model.entity.NotificationRule;
import com.storage.model.notification.StorageData;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationRule> getAll();

    NotificationRule add(NotificationRuleCreateDto dto);

    void delete(UUID id);

    List<String> checkRule(StorageData data);
}
