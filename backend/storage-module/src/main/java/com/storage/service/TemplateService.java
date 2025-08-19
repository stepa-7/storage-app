package com.storage.service;

import com.storage.model.dto.template.TemplateCreate;
import com.storage.model.dto.template.TemplateUpdate;
import com.storage.model.entity.Template;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

public interface TemplateService {
    List<Template> getAll(Boolean isDeleted, String name);

    Template create(TemplateCreate dto);

    Template get(UUID id);

    Template patch(UUID id, TemplateUpdate dto);

    void markDeleted(@PathVariable UUID id);
}
