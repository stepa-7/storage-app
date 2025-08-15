package com.storage.service;

import com.storage.exception.NotFoundException;
import com.storage.model.dto.template.TemplateCreate;
import com.storage.model.dto.template.TemplateUpdate;
import com.storage.model.entity.Template;
import com.storage.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TemplateService {
    private final TemplateRepository repo;

    public List<Template> getAll(Boolean isDeleted, String name) {
        List<Template> all = repo.findAll();
        return all.stream()
                .filter(t -> isDeleted == null || t.isDeleted() == isDeleted)
                .filter(t -> name == null || t.getName().contains(name))
                .toList();
    }

    public Template create(TemplateCreate dto) {
        Template t = Template.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .schema(dto.getSchema())
                .build();
        return repo.save(t);
    }

    public Template get(UUID id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("template not found"));
    }

    public Template patch(UUID id, TemplateUpdate dto) {
        Template t = get(id);
        if (dto.getName() != null) t.setName(dto.getName());
        if (dto.getDescription() != null) {t.setDescription(dto.getDescription());}
        if (dto.getIsDeleted() != null) t.setDeleted(dto.getIsDeleted());
        return repo.save(t);
    }

    public void markDeleted(@PathVariable UUID id) {
        Template t = get(id);
        t.setDeleted(true);
        repo.save(t);
    }
}
