package com.storage.model.dto.template;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TemplateUpdate {
    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9\\sа-яА-ЯёЁ]+$", message = "Only letters, numbers and spaces allowed")
    private String name;

    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9\\sа-яА-ЯёЁ]+$", message = "Only letters, numbers and spaces allowed")
    private String description;

    @JsonProperty("is_deleted")
    private Boolean isDeleted;
}