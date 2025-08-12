package com.storage.controller;

import com.storage.model.dto.StorageObjectCreate;
import com.storage.model.dto.StorageObjectUpdate;
import com.storage.model.objects.StorageObject;
import com.storage.service.StorageObjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/objects")
@RequiredArgsConstructor
public class StorageObjectController {

    private final StorageObjectService service;

    @GetMapping
    public ResponseEntity<List<StorageObject>> list(
            @RequestParam(required = false) UUID storage_id,
            @RequestParam(required = false) UUID template_id,
            @RequestParam(required = false) Boolean decommissioned) {
        return new ResponseEntity<>(service.find(storage_id, template_id, decommissioned), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<StorageObject> create(@RequestBody StorageObjectCreate create) {
        StorageObject storageObject = service.create(create);
        return new ResponseEntity<>(storageObject, HttpStatus.valueOf(201));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StorageObject> get(@PathVariable UUID id) {
        return new ResponseEntity<>(service.getById(id), HttpStatus.valueOf(200));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<StorageObject> patch(@PathVariable UUID id, @RequestBody StorageObjectUpdate update) {
        return new ResponseEntity<>(service.patch(id, update), HttpStatus.valueOf(200));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return new ResponseEntity<>(HttpStatus.valueOf(204));
    }

}
