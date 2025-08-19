package com.storage.model.dto.storage_object;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class StorageObjectCreate {

    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9\\sа-яА-ЯёЁ]+$", message = "Only letters, numbers and spaces allowed")
    private String name;

    @NotNull(message = "Template ID cannot be null")
    @JsonProperty("template_id")
    private UUID templateId;

    @NotNull(message = "Storage ID cannot be null")
    @JsonProperty("storage_id")
    private UUID storageId;

    @PositiveOrZero(message = "Capacity can't be negative")
    private Double size;

    @NotNull(message = "Unit ID cannot be null")
    @JsonProperty("unit_id")
    private UUID unitId;

    private Map<String, Object> attributes;

    @JsonProperty("photo_url")
//    @Pattern(regexp = "^[0-9a-fA-F-]{36}\\.[a-zA-Z0-9]{3,4}$\n")
    private String photoUrl;
}
