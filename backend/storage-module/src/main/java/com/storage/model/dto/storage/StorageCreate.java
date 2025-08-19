package com.storage.model.dto.storage;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class StorageCreate {
    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9\\sа-яА-ЯёЁ]+$", message = "Only letters, numbers and spaces allowed")
    private String name;

    @NotNull(message = "Capacity cannot be null")
    @DecimalMin(value = "1.0", message = "Minimum capacity is 1")
    @PositiveOrZero(message = "Capacity can't be negative")
    private Double capacity;

    @JsonProperty("unit_id")
    private UUID unitId;

    @JsonProperty("parent_id")
    private UUID parentId;
}
