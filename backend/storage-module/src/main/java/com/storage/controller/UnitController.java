package com.storage.controller;

import com.storage.model.objects.Unit;
import com.storage.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
public class UnitController {
    private final UnitRepository repo;

    @GetMapping
    public List<Unit> list() {
        return repo.findAll();
    }
}