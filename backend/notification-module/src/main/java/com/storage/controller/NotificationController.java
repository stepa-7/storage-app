package com.storage.controller;

import com.storage.model.StorageEvent;
import com.storage.model.StorageEventCreate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notification")
public class NotificationController {


    @PostMapping
    public ResponseEntity<StorageEvent> add(@RequestBody StorageEventCreate eventCreate) {
        return new ResponseEntity<>();
    }

    @GetMapping
    public ResponseEntity<List<StorageEvent>> getAll() {

    }
}
