package com.storage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class StorageObjectUpdate {
    private String name;
    private UUID storage_id;
    private Long size;
    private List<Object> attributes;
    private Boolean is_decommissioned;
}
