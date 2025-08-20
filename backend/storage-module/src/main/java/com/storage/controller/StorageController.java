package com.storage.controller;

import com.storage.model.dto.storage.StorageCreate;
import com.storage.model.dto.storage.StorageUpdate;
import com.storage.model.entity.Storage;
import com.storage.service.StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/storages")
@RequiredArgsConstructor
public class StorageController {
    private final StorageService storageService;

    @GetMapping
    public ResponseEntity<List<Storage>> getStorages(@RequestParam(value = "parent_id", required = false) @Valid UUID parentId) {
        return new ResponseEntity<>(storageService.getAll(parentId),HttpStatus.valueOf(200));
    }

    @PostMapping
    public ResponseEntity<Storage> createStorage(@RequestBody @Valid StorageCreate dto) {
        Storage created = storageService.create(dto);
        return new ResponseEntity<>(created,HttpStatus.valueOf(201));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Storage> getStorage(@PathVariable @Valid UUID id) {
        return new ResponseEntity<>(storageService.getById(id),HttpStatus.valueOf(200));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Storage> updateStorage(@PathVariable @Valid UUID id, @RequestBody @Valid StorageUpdate dto) {
        Storage updated = storageService.update(id, dto);
        return new ResponseEntity<>(updated,HttpStatus.valueOf(200));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStorage(@PathVariable @Valid UUID id) {
        storageService.delete(id);
        return new ResponseEntity<>(HttpStatus.valueOf(204));
    }
}
