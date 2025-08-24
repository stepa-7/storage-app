package com.storage.model.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class StorageData {
    private UUID storageId;
    private String storageName;
    private Double fullness;
    private Double capacity;
}