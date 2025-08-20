package com.storage.service;

import com.storage.model.dto.storage.StorageCreate;
import com.storage.model.dto.storage.StorageUpdate;
import com.storage.model.entity.Storage;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface StorageService {
    @Transactional(readOnly = true)
    List<Storage> getAll(UUID parentId);

    @Transactional(readOnly = true)
    Storage getById(UUID id);

    @Transactional
    Storage create(StorageCreate dto);

    @Transactional
    Storage update(UUID id, StorageUpdate dto);

    void updateParentStorage(Storage storage, UUID newParentId);

    boolean isCircularReference(Storage storage, Storage potentialParent);

    @Transactional
    void delete(UUID id);

    @Transactional(readOnly = true)
    boolean canAccommodate(UUID storageId, double deltaSize);

    double calculateFullness(UUID storageId);
}
