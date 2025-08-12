package com.storage.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storage.model.dto.TemplateCreate;
import com.storage.model.dto.TemplateUpdate;
import com.storage.model.objects.Template;
import com.storage.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {
    private final TemplateRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping
    public List<Template> list(@RequestParam(required = false, name = "is_deleted") Boolean isDeleted,
                               @RequestParam(required = false, name = "name") String name) {
        List<Template> all = repo.findAll();
        return all.stream()
                .filter(t -> isDeleted == null || t.isDeleted() == isDeleted)
                .filter(t -> name == null || t.getName().contains(name))
                .toList();
    }

    @PostMapping
    public ResponseEntity<Template> create(@RequestBody TemplateCreate dto) {
        Template t = new Template();
        t.setName(dto.getName());
        try {
            t.setSchema(mapper.writeValueAsString(dto.getSchema()));
        } catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid schema"); }
        Template saved = repo.save(t);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public Template get(@PathVariable UUID id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "template not found"));
    }

    @PatchMapping("/{id}")
    public Template patch(@PathVariable UUID id, @RequestBody TemplateUpdate dto) {
        Template t = get(id);
        if (dto.getName() != null) t.setName(dto.getName());
        if (dto.getDescription() != null) {t.setDescription(dto.getDescription());}
        if (dto.getIs_deleted() != null) t.setDeleted(dto.getIs_deleted());
        return repo.save(t);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> markDeleted(@PathVariable UUID id) {
        Template t = get(id);
        t.setDeleted(true);
        repo.save(t);
        return ResponseEntity.noContent().build();
    }
}