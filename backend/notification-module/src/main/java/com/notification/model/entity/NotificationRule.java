package com.notification.model.entity;

import com.notification.model.NotificationCondition;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class NotificationRule {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "storage_id", nullable = false)
    private UUID storageId;

    // измеряем в процентах
    @Column(name = "threshold_value", nullable = false)
    private Integer thresholdValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationCondition condition;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Timestamp updatedAt;
}
