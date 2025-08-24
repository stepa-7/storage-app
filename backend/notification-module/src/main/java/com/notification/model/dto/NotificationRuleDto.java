package com.notification.model.dto;

import com.notification.model.NotificationCondition;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.sql.Timestamp;
import java.util.UUID;

@Data
public class NotificationRuleDto {
    private UUID id;
    private String name;
    private String description;
    private UUID storageId;
    // измеряем в процентах
    @Max(value = 100, message = "Upper border is higher then 100%")
    @Min(value = 0, message = "Upper border is lower then 0%")
    private Integer thresholdValue;
    private NotificationCondition condition;
    private boolean isActive;
    private UUID createdBy;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
