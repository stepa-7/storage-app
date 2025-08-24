package com.notification.service.impl;

import com.notification.model.NotificationCondition;
import com.notification.model.dto.NotificationRuleCreateDto;
import com.notification.model.entity.NotificationRule;
import com.notification.service.NotificationService;
import com.storage.config.UserContext;
import com.storage.model.notification.StorageData;
import com.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserContext userContext;

    @Override
    public List<NotificationRule> getAll(){
        return notificationRepository.findAll();
    }

    @Override
    public NotificationRule add(NotificationRuleCreateDto dto) {
        UUID currentUserId = userContext.getCurrentUserId();

        NotificationRule rule = NotificationRule.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .storageId(dto.getStorageId())
                .thresholdValue(dto.getThresholdValue())
                .condition(dto.getCondition())
                .isActive(true)
                .createdBy(currentUserId)
                .build();

        return notificationRepository.save(rule);
    }

//    public NotificationRule update(UUID id, NotificationRuleDto dto) {
//        NotificationRule rule = notificationRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Rule not found: " + id));
//        rule.setName(dto.getName());
//        rule.setDescription(dto.getDescription());
//        rule.setThresholdValue(dto.getThresholdValue());
//        rule.setCondition(dto.getCondition());
//        rule.setActive(dto.isActive());
//
//        return notificationRepository.save(rule);
//    }

    @Override
    public void delete(UUID id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public List<String> checkRule(StorageData data) {
        List<String> notifications = new ArrayList<>();
        List<NotificationRule> rules = notificationRepository.getByStorageId(data.getStorageId());

        double fullnessPercentage = (data.getFullness() / data.getCapacity()) * 100;

        for (NotificationRule rule : rules) {
            if (!rule.isActive()) continue;

            if (rule.getCondition() == NotificationCondition.BELOW && fullnessPercentage < rule.getThresholdValue()) {
                notifications.add("Storage " + data.getStorageName() + " fullness is BELOW " +
                        rule.getThresholdValue() + "% (current: " + String.format("%.1f", fullnessPercentage) + "%)");
            } else if (rule.getCondition() == NotificationCondition.ABOVE && fullnessPercentage > rule.getThresholdValue()) {
                notifications.add("Storage " + data.getStorageName() + " fullness is ABOVE " +
                        rule.getThresholdValue() + "% (current: " + String.format("%.1f", fullnessPercentage) + "%)");
            }
        }

        return notifications;
    }

}
