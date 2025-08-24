package com.notification.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.notification.model.NotificationCondition;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class NotificationRuleCreateDto {
    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9\\sа-яА-ЯёЁ]+$", message = "Only letters, numbers and spaces allowed")
    private String name;

    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9\\sа-яА-ЯёЁ]+$", message = "Only letters, numbers and spaces allowed")
    private String description;

    @NotNull(message = "Storage ID cannot be null")
    @JsonProperty("storage_id")
    private UUID storageId;

    @NotNull
    @Max(value = 100, message = "Threshold cannot exceed 100%")
    @Min(value = 0, message = "Threshold cannot be below 0%")
    private Integer thresholdValue;

    @NotNull(message = "Condition cannot be null")
    private NotificationCondition condition;
}