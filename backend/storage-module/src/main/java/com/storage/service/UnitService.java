package com.storage.service;

import com.storage.model.dto.unit.UnitCreate;
import com.storage.model.entity.Unit;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;
import java.util.UUID;

public interface UnitService {
    @GetMapping
    List<Unit> getAll();

    @PostMapping
    Unit create(UnitCreate dto);

    void delete(UUID uuid);
}
