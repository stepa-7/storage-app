package com.storage.model;

import lombok.Data;

import java.util.UUID;

@Data
public class StorageEventCreate {
    private UUID storageId;
    // измеряем в процентах
    private Double upperLimit = 100.;
    private Double lowerLimit = 0.;
}
