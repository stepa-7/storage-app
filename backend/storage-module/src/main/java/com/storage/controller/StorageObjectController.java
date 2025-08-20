package com.storage.controller;

import com.storage.model.dto.storage_object.StorageObjectCreate;
import com.storage.model.dto.storage_object.StorageObjectCreateWithFileDto;
import com.storage.model.dto.storage_object.StorageObjectUpdate;
import com.storage.model.dto.storage_object.StorageObjectUpdateWithFileDto;
import com.storage.model.entity.StorageObject;
import com.storage.service.FileImageService;
import com.storage.service.StorageObjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/objects")
@RequiredArgsConstructor
public class StorageObjectController {

    private final StorageObjectService service;
    private final FileImageService fileImageService;

    @GetMapping
    public ResponseEntity<List<StorageObject>> list(
            @RequestParam(required = false) @Valid UUID storage_id,
            @RequestParam(required = false) @Valid UUID template_id,
            @RequestParam(required = false) @Valid Boolean decommissioned) {
        return new ResponseEntity<>(service.find(storage_id, template_id, decommissioned), HttpStatus.OK);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StorageObject> createFromFile(
            @ModelAttribute @Valid StorageObjectCreateWithFileDto dto) {
        StorageObject storageObject = service.createWithFile(dto);
        return new ResponseEntity<>(storageObject, HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StorageObject> createFromJson(@RequestBody @Valid StorageObjectCreate dto) {
        StorageObject created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> downloadImage(@PathVariable UUID id) {
        StorageObject object = service.getById(id);

        byte[] image = fileImageService.getObject(object.getPhotoUrl());

        return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .body(image);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StorageObject> get(@PathVariable @Valid UUID id) {
        return new ResponseEntity<>(service.getById(id), HttpStatus.valueOf(200));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<StorageObject> patch(@PathVariable @Valid UUID id, @RequestBody @Valid StorageObjectUpdate update) {
        return new ResponseEntity<>(service.patch(id, update), HttpStatus.valueOf(200));
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StorageObject> updateFromFile(
            @PathVariable UUID id,
            @ModelAttribute @Valid StorageObjectUpdateWithFileDto dto) {
        StorageObject storageObject = service.updateWithFile(id, dto);
        return new ResponseEntity<>(storageObject, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Valid UUID id) {
        service.delete(id);
        return new ResponseEntity<>(HttpStatus.valueOf(204));
    }
}
