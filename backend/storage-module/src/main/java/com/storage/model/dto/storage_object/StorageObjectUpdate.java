package com.storage.model.dto.storage_object;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class StorageObjectUpdate {

    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9\\sа-яА-ЯёЁ]+$", message = "Only letters, numbers and spaces allowed")
    private String name;

    @NotBlank
    @JsonProperty("storage_id")
    private UUID storageId;

    @NotBlank
    @PositiveOrZero(message = "Capacity can't be negative")
    private Double size;

    private Map<String, Object> attributes;

    @JsonProperty("is_decommissioned")
    private Boolean isDecommissioned;
}
