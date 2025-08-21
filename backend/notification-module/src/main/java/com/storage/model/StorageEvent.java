package com.storage.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Builder
@Table(name = "notifications")
public class StorageEvent {
    @Id
    @GeneratedValue
    private UUID id;
    private UUID storageId;
    // измеряем в процентах
    private Double upperLimit = 100.;
    private Double lowerLimit = 0.;
}
