package com.storage.service.impl;

import com.storage.exception.NotValidException;
import com.storage.model.dto.unit.UnitCreate;
import com.storage.model.entity.Unit;
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements com.storage.service.UnitService {
    private final UnitRepository unitRepo;
    private final StorageObjectRepository objectRepo;
    private final StorageRepository storageRepo;

    @GetMapping
    @Override
    public List<Unit> getAll() {
        return unitRepo.findAll();
    }

    @PostMapping
    @Override
    public Unit create(UnitCreate dto) {
        Unit t = Unit.builder()
                .name(dto.getName())
                .symbol(dto.getSymbol())
                .build();
        return unitRepo.save(t);
    }

    @Override
    public void delete(UUID uuid) {
        if (!objectRepo.findByUnitId(uuid).isEmpty() || !storageRepo.findByUnitId(uuid).isEmpty()) {
            throw new NotValidException("Exists objects or storages what using this unit");
        }
        unitRepo.deleteById(uuid);
    }
}
