package com.storage.controller;

import com.storage.model.dto.template.TemplateCreate;
import com.storage.model.dto.template.TemplateUpdate;
import com.storage.model.entity.Template;
import com.storage.repository.TemplateRepository;
import com.storage.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {
    private final TemplateRepository repo;
    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<List<Template>> list(@RequestParam(required = false, name = "is_deleted") Boolean isDeleted,
                                               @RequestParam(required = false, name = "name") String name) {
        List<Template> all = templateService.getAll(isDeleted, name);
        return new ResponseEntity<>(all, HttpStatus.valueOf(200));
    }

    @PostMapping
    public ResponseEntity<Template> create(@RequestBody TemplateCreate dto) {
        Template t = templateService.create(dto);
        return new ResponseEntity<>(t, HttpStatus.valueOf(201));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Template> get(@PathVariable UUID id) {
        Template t = templateService.get(id);
        return new ResponseEntity<>(t, HttpStatus.valueOf(200));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Template> patch(@PathVariable UUID id, @RequestBody TemplateUpdate dto) {
        Template t = templateService.patch(id, dto);
        return new ResponseEntity<>(t, HttpStatus.valueOf(200));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> markDeleted(@PathVariable UUID id) {
        templateService.markDeleted(id);
        return new ResponseEntity<>(HttpStatus.valueOf(200));
    }
}