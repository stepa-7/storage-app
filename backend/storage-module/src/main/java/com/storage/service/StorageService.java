package com.storage.service;

import com.storage.exception.NotFoundException;
import com.storage.exception.NotValidException;
import com.storage.exception.StorageCapacityException;
import com.storage.model.dto.storage.StorageCreate;
import com.storage.model.dto.storage.StorageUpdate;
import com.storage.model.entity.Storage;
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final StorageRepository storageRepository;
    private final StorageObjectRepository objectRepository;
    private final UnitRepository unitRepository;

    public List<Storage> getAll(UUID parentId) {
        if (parentId != null) {
            return storageRepository.findByParentId(parentId);
        }
        return storageRepository.findAll();
    }

    public Storage getById(UUID id) {
        return storageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Storage not found"));
    }

    @Transactional
    public Storage create(StorageCreate dto) {
        if (!unitRepository.existsById(dto.getUnitId())) {
            throw new NotFoundException("Unit not found");
        }

        if (dto.getParentId() != null) {
            Storage parent = storageRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new NotFoundException("Parent storage not found"));
            if(parent.getParentId() != null && parent.getParentId().equals(dto.getParentId())){
                throw new NotValidException("Can't make a nested storage");
            }
            if(parent.getCapacity() - parent.getFullness() < dto.getCapacity()) {
                throw new StorageCapacityException(String.format(
                        "Parent storage has insufficient space. Required: %.2f, Available: %.2f",
                        dto.getCapacity(), parent.getCapacity() - parent.getFullness()));
            }
            parent.setFullness(parent.getFullness()+dto.getCapacity());
        }

        Storage storage = Storage.builder()
                .name(dto.getName())
                .capacity(dto.getCapacity())
                .unitId(dto.getUnitId())
                .parentId(dto.getParentId())
                .build();

        return storageRepository.save(storage);
    }

    @Transactional
    public Storage update(UUID id, StorageUpdate dto) {
        Storage storage = getById(id);
        boolean hasChanges = false;

        if (!dto.getName().equals(storage.getName())) {
            storage.setName(dto.getName());
            hasChanges = true;
        }

        if (!dto.getCapacity().equals(storage.getCapacity())) {
            validateCapacityChange(storage, dto.getCapacity());
            storage.setCapacity(dto.getCapacity());
            hasChanges = true;
        }

        if (!dto.getParentId().equals(storage.getParentId())) {
            updateParentStorage(storage, dto.getParentId());
            hasChanges = true;
        }

        return hasChanges ? storageRepository.save(storage) : storage;
    }

    private void validateCapacityChange(Storage storage, Double newCapacity) {
        if (newCapacity.equals(storage.getCapacity())) {
            return;
        }

        if (newCapacity < storage.getFullness()) {
            throw new StorageCapacityException(String.format(
                    "New capacity (%.2f) cannot be less than current fullness (%.2f)",
                    newCapacity, storage.getFullness()));
        }

        if (storage.getParentId() != null) {
            Storage parent = storageRepository.findById(storage.getParentId())
                    .orElseThrow(() -> new NotFoundException("Parent storage not found"));

            double requiredSpace = newCapacity - storage.getCapacity();
            if (parent.getCapacity() - parent.getFullness() < requiredSpace) {
                throw new StorageCapacityException(String.format(
                        "Parent storage has insufficient space. Required: %.2f, Available: %.2f",
                        requiredSpace, parent.getCapacity() - parent.getFullness()));
            }
        }
    }

    private void updateParentStorage(Storage storage, UUID newParentId) {
        if (newParentId.equals(storage.getParentId())) {
            return;
        }

        Storage newParent = storageRepository.findById(newParentId)
                .orElseThrow(() -> new NotFoundException("New parent storage not found"));

        if (isCircularReference(storage, newParent)) {
            throw new NotValidException("Circular reference detected in storage hierarchy");
        }

        if (newParent.getCapacity() - newParent.getFullness() < storage.getCapacity()) {
            throw new StorageCapacityException(String.format(
                    "New parent storage has insufficient space. Required: %.2f, Available: %.2f",
                    storage.getCapacity(), newParent.getCapacity() - newParent.getFullness()));
        }

        if (storage.getParentId() != null) {
            Storage oldParent = storageRepository.findById(storage.getParentId())
                    .orElseThrow(() -> new NotFoundException("Old parent storage not found"));
            oldParent.setFullness(oldParent.getFullness() - storage.getCapacity());
            storageRepository.save(oldParent);
        }

        newParent.setFullness(newParent.getFullness() + storage.getCapacity());
        storage.setParentId(newParentId);
        storageRepository.save(newParent);
    }

    private boolean isCircularReference(Storage storage, Storage potentialParent) {
        if (storage.getId().equals(potentialParent.getId())) {
            return true;
        }

        UUID currentParentId = potentialParent.getParentId();
        while (currentParentId != null) {
            if (currentParentId.equals(storage.getId())) {
                return true;
            }
            Storage currentParent = storageRepository.findById(currentParentId)
                    .orElseThrow(() -> new NotFoundException("Parent storage in chain not found"));
            currentParentId = currentParent.getParentId();
        }

        return false;
    }

    @Transactional
    public void delete(UUID id) {
        Storage storage = getById(id);

        boolean hasChildren = !storageRepository.findByParentId(storage.getId()).isEmpty();
        if (hasChildren) {
            throw new NotValidException("Unable to delete repository: there are nested repositories");
        }

        if (storage.getParentId() != null) {
            storageRepository.findById(storage.getParentId()).ifPresent(parent -> {
                parent.setFullness(parent.getFullness() - storage.getCapacity());
            });
        }

        objectRepository.deleteByStorageId(storage.getId());

        storageRepository.delete(storage);
    }
}
