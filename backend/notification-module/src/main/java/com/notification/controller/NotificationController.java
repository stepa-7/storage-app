package com.notification.controller;

import com.notification.model.dto.NotificationRuleCreateDto;
import com.notification.model.entity.NotificationRule;
import com.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications/rules")
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationRule> add(@Valid @RequestBody NotificationRuleCreateDto dto) {
        NotificationRule notificationRule = notificationService.add(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationRule);
    }

    @GetMapping
    public ResponseEntity<List<NotificationRule>> getAllRules() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<NotificationRule> delete(@PathVariable UUID id) {
        notificationService.delete(id);
        return new ResponseEntity<>(HttpStatus.valueOf(200));
    }

//    @PatchMapping("/{id}")
//    public ResponseEntity<NotificationRule> patch(@PathVariable UUID id, @RequestBody NotificationRuleDto eventCreate) {
//        notificationService.update(id, eventCreate);
//        return new ResponseEntity<>(HttpStatus.valueOf(201));
//    }
}
