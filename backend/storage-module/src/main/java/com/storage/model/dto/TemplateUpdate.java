package com.storage.model.dto;

import lombok.Data;

import java.util.Map;

@Data
public class TemplateUpdate {
    private String name;
    private String description;
    private Boolean is_deleted;
}