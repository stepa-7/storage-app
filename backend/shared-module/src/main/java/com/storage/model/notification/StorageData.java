package com.storage.model.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageData {
    private UUID storageId;
    private String storageName;
    private Double fullness;
    private Double capacity;
    private String userEmail;
    private UUID userId;
}