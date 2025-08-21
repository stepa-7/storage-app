package com.storage.service;

import com.storage.model.dto.storage_object.StorageObjectCreate;
import com.storage.model.dto.storage_object.StorageObjectCreateWithFileDto;
import com.storage.model.dto.storage_object.StorageObjectUpdate;
import com.storage.model.dto.storage_object.StorageObjectUpdateWithFileDto;
import com.storage.model.entity.Storage;
import com.storage.model.entity.StorageObject;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface StorageObjectService {
    List<StorageObject> find(UUID storageId, UUID templateId, Boolean decommissioned);

    StorageObject getById(UUID id);

    @Transactional
    StorageObject create(StorageObjectCreate dto);

    @Transactional
    StorageObject createWithFile(StorageObjectCreateWithFileDto createWithFileDto);

    @Transactional
    StorageObject patch(UUID id, StorageObjectUpdate dto);

    @Transactional
    StorageObject updateWithFile(UUID id, StorageObjectUpdateWithFileDto updateWithFileDto);

    @Transactional
    void delete(UUID id);

    void checkAccommodation(Storage storage, Double size, Double delta);
}
