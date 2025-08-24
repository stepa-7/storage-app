package com.storage.service.impl;

import com.storage.config.UserContext;
import com.storage.exception.NotFoundException;
import com.storage.exception.NotValidException;
import com.storage.exception.StorageCapacityException;
import com.storage.exception.StorageNotEmptyException;
import com.storage.model.dto.storage.StorageCreate;
import com.storage.model.dto.storage.StorageUpdate;
import com.storage.model.entity.Storage;
import com.storage.model.notification.StorageData;
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.UnitRepository;
import com.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageServiceImpl implements StorageService {

    private final StorageRepository storageRepository;
    private final StorageObjectRepository objectRepository;
    private final UnitRepository unitRepository;
    private final KafkaTemplate<String, StorageData> kafkaTemplate;
    private final UserContext userContext;

    @Transactional(readOnly = true)
    @Override
    public List<Storage> getAll(UUID parentId) {
        if (parentId != null) {
            return storageRepository.findByParentIdAndIsDeletedFalse(parentId);
        }
        return storageRepository.findByIsDeletedFalse();
    }

    @Transactional(readOnly = true)
    @Override
    public Storage getById(UUID id) {
        return storageRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Storage not found"));
    }

    @Transactional
    @Override
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
        }

        UUID currentUserId = userContext.getCurrentUserId();

        Storage storage = Storage.builder()
                .name(dto.getName())
                .capacity(dto.getCapacity())
                .unitId(dto.getUnitId())
                .parentId(dto.getParentId())
                .createdBy(currentUserId)
                .build();

        return storageRepository.save(storage);
    }

    @Transactional
    @Override
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

        if (dto.getParentId()!=null && !dto.getParentId().equals(storage.getParentId())) {
            updateParentStorage(storage, dto.getParentId());
            hasChanges = true;
        }
        sendData(storage);

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
    }

    @Override
    public void updateParentStorage(Storage storage, UUID newParentId) {
        if (newParentId.equals(storage.getParentId())) {
            return;
        }

        Storage newParent = storageRepository.findById(newParentId)
                .orElseThrow(() -> new NotFoundException("New parent storage not found"));

        if (isCircularReference(storage, newParent)) {
            throw new NotValidException("Circular reference detected in storage hierarchy");
        }
        storage.setParentId(newParentId);
        storageRepository.save(newParent);
        storageRepository.save(storage);
    }

    @Override
    public boolean isCircularReference(Storage storage, Storage potentialParent) {
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
    @Override
    public void delete(UUID id) {
        Storage storage = getById(id);

        boolean hasChildren = storageRepository.existsByParentIdAndIsDeletedFalse(id);
        boolean hasObjects = objectRepository.existsByStorageIdAndDecommissionedFalse(id);

        if (hasChildren || hasObjects) {
//        if (hasChildren) {
            throw new StorageNotEmptyException("Cannot delete storage with child storages or objects");
        }

//        objectRepository.markAsDecommissionedByStorageId(id);

//        if (storage.getParentId() != null) {
//            Storage parent = storageRepository.findById(storage.getParentId())
//                    .orElseThrow(() -> new NotFoundException("Parent storage not found"));
//            parent.setFullness(parent.getFullness() - storage.getFullness());
//            storageRepository.save(parent);
//        }

//        objectRepository.deleteByStorageId(storage.getId());
//        storageRepository.delete(storage);
        storage.setDeleted(true);
        storageRepository.save(storage);
    }

    @Transactional(readOnly = true)
    @Override
    public boolean canAccommodate(UUID storageId, double deltaSize) {
        Storage storage = storageRepository.findByIdAndIsDeletedFalse(storageId)
                .orElseThrow(() -> new NotFoundException("Storage not found: " + storageId));

        double fullness = calculateFullness(storageId);
        return fullness + deltaSize <= storage.getCapacity();
//        return storage.getFullness() + deltaSize <= storage.getCapacity();
    }

    @Override
    public double calculateFullness(UUID storageId) {
        return objectRepository.sumSizesByStorageId(storageId).orElse(0.0);
    }

    private void sendData(Storage storage) {
        StorageData event = StorageData.builder()
                .storageId(storage.getId())
                .storageName(storage.getName())
                .capacity(storage.getCapacity())
                .fullness(storage.getFullness())
                .build();

            kafkaTemplate.send("storage-notification" ,event);

    }
}