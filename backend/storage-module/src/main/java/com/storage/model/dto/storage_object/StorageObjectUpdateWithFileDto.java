package com.storage.model.dto.storage_object;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class StorageObjectUpdateWithFileDto {
    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9\\sа-яА-ЯёЁ]+$", message = "Only letters, numbers and spaces allowed")
    private String name;

    @NotNull(message = "Storage ID cannot be null")
    @JsonProperty("storage_id")
    private UUID storageId;

    @NotNull
    @PositiveOrZero(message = "Capacity can't be negative")
    private Double size;

    private String attributes;

    @JsonProperty("is_decommissioned")
    private Boolean isDecommissioned;

    private MultipartFile photo;
}
