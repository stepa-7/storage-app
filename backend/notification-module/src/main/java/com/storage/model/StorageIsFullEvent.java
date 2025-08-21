package com.storage.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class StorageIsFullEvent {
    private UUID storageUuid;
    private String storageName;
    private Double size;
    private Double used;
}