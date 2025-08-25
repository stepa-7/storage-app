package com.storage.controller;

import com.storage.model.dto.unit.UnitCreate;
import com.storage.model.entity.Unit;
import com.storage.service.UnitService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
public class UnitController {
    private final UnitService unitService;

    @GetMapping
    public ResponseEntity<List<Unit>> list() {
        List<Unit> list = unitService.getAll();
        return new ResponseEntity<>(list, HttpStatus.valueOf(200));
    }

    @PostMapping
    public ResponseEntity<Unit> create(@RequestBody UnitCreate dto) {
        Unit u = unitService.create(dto);
        return new ResponseEntity<>(u, HttpStatus.valueOf(200));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Valid @NotNull UUID id) {
        unitService.delete(id);
        return new ResponseEntity<>(HttpStatus.valueOf(204));
    }
}