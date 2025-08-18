package com.storage.model.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.sql.Timestamp;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "storage_object")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class StorageObject {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "storage_id")
    private UUID storageId;

    private double size;

    @Column(name = "unit_id")
    private UUID unitId;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> attributes;

    @Column(name = "photo_url", unique = true)
    private String photoUrl;

    private boolean decommissioned = false;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;
}