package com.storage.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class StorageData {
    private UUID storageId;
    private String storageName;
    private Double capacity;
    private Double fullness;
}