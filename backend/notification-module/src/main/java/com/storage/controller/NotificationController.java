package com.storage.controller;

import com.storage.model.StorageEvent;
import com.storage.model.StorageEventCreate;
import com.storage.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<StorageEvent> add(@RequestBody StorageEventCreate eventCreate) {
        StorageEvent storageEvent = notificationService.add(eventCreate);
        return new ResponseEntity<>(storageEvent, HttpStatus.valueOf(201));
    }

    @GetMapping
    public ResponseEntity<List<StorageEvent>> getAll() {
        List<StorageEvent> storageEvents = notificationService.getAll();
        return new ResponseEntity<>(storageEvents, HttpStatus.valueOf(200));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        notificationService.delete(id);
        return new ResponseEntity<>(HttpStatus.valueOf(200));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<StorageEvent> patch(@PathVariable UUID id, @RequestBody StorageEventCreate eventCreate) {
        notificationService.update(id, eventCreate);
        return new ResponseEntity<>(HttpStatus.valueOf(201));
    }
}
