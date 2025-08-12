package com.storage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class StorageObjectCreate {
    private String name;
    private UUID template_id;
    private UUID storage_id;
    private Long size;
    private UUID unit_id;
    private List<Object> attributes;
    private String photo_url;
}
