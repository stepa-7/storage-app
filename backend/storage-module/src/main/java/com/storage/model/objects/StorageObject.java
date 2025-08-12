package com.storage.model.objects;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import jakarta.persistence.*;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "storage_object")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageObject {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "template_id")
    private Template template;

    @ManyToOne
    @JoinColumn(name = "storage_id")
    private Storage storage;

    private double size;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @Column(columnDefinition = "jsonb")
    private String attributes;

    private String photoUrl;
    private boolean decommissioned = false;
    private UUID createdBy;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
}