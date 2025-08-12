package com.storage.model.dto;

import lombok.Data;

import java.util.Map;

@Data
public class TemplateCreate {
    private String name;
    private Map<String,Object> schema;
    private String description;
}