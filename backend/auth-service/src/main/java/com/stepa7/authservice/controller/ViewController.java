package com.stepa7.authservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ViewController {
    @GetMapping("/profile")
    public ResponseEntity<?> profilePage() {
        return ResponseEntity.ok().body("Authorized");
    }
}