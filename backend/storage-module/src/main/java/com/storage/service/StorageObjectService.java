package com.storage.service;

import com.storage.exception.NotFoundException;
import com.storage.exception.NotValidException;
import com.storage.exception.StorageCapacityException;
import com.storage.model.dto.storage_object.StorageObjectCreate;
import com.storage.model.dto.storage_object.StorageObjectUpdate;
import com.storage.model.entity.Storage;
import com.storage.model.entity.StorageObject;
import com.storage.model.entity.Template;
import com.storage.model.entity.Unit;
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.TemplateRepository;
import com.storage.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageObjectService {
    private final StorageObjectRepository objectRepo;
    private final StorageRepository storageRepo;
    private final UnitRepository unitRepo;
    private final TemplateRepository templateRepo;

    public List<StorageObject> find(UUID storageId, UUID templateId, Boolean decommissioned) {
        if (storageId != null) return objectRepo.findByStorageId(storageId);
        if (templateId != null) return objectRepo.findByTemplateId(templateId);
        if (decommissioned != null) return objectRepo.findByDecommissioned(decommissioned);
        return objectRepo.findAll();
    }

    public StorageObject getById(UUID id) {
        return objectRepo.findById(id).orElseThrow(() -> new NotFoundException("object not found"));
    }

    @Transactional
    public StorageObject create(StorageObjectCreate dto) {

        Storage storage = storageRepo.findByIdForUpdate(dto.getStorageId())
                .orElseThrow(() -> new NotFoundException("Storage not found with id: " + dto.getStorageId()));

        Unit unit = unitRepo.findById(dto.getUnitId())
                .orElseThrow(() -> new NotFoundException("Unit not found with id: " + dto.getUnitId()));

        Template template = templateRepo.findById(dto.getTemplateId())
                .orElseThrow(() -> new NotFoundException("Template not found with id: " + dto.getTemplateId()));

        if ((storage.getFullness() + dto.getSize()) > storage.getCapacity()) {
            throw new StorageCapacityException(String.format(
                    "Storage capacity exceeded. Current: %.2f/%.2f, Requested: +%.2f",
                    storage.getFullness(), storage.getCapacity(), dto.getSize()));
        }

        StorageObject obj = StorageObject.builder()
                .name(dto.getName())
                .size(dto.getSize())
                .storageId(storage.getId())
                .unitId(unit.getId())
                .templateId(template.getId())
                .photoUrl(dto.getPhotoUrl())
                .decommissioned(false)
                .build();

        storage.setFullness(storage.getFullness()+obj.getSize());
        storageRepo.save(storage);

        try {
            if (dto.getAttributes() != null) {
                obj.setAttributes(dto.getAttributes());
            }
        } catch (Exception ex) {
            throw new NotValidException("Invalid attributes format");
        }

        return objectRepo.save(obj);
    }

    @Transactional
    public StorageObject patch(UUID id, StorageObjectUpdate dto) {
        StorageObject obj = getById(id);

        if (!dto.getName().equals(dto.getName())) {
            obj.setName(dto.getName());
        }
        if (dto.getSize() != obj.getSize()) {
            obj.setSize(dto.getSize());
        }

        UUID oldStorageId = obj.getStorageId();
        UUID newStorageId = dto.getStorageId();

        Storage oldStorage = storageRepo.findByIdForUpdate(oldStorageId)
                .orElseThrow(() -> new NotFoundException("Old parent storage not found"));

        if(!oldStorageId.equals(newStorageId)){
            Storage newStorage = storageRepo.findByIdForUpdate(newStorageId)
                    .orElseThrow(() -> new NotFoundException("New parent storage not found"));

            if ((newStorage.getFullness() + dto.getSize()) > newStorage.getCapacity()) {
                throw new  StorageCapacityException(String.format(
                        "New storage capacity exceeded. Available: %.2f, Required: %.2f",
                        newStorage.getCapacity() - newStorage.getFullness(),
                        dto.getSize()));
            }
            oldStorage.setFullness(oldStorage.getFullness() - obj.getSize());
            newStorage.setFullness(newStorage.getFullness() + dto.getSize());
            storageRepo.saveAll(List.of(oldStorage, newStorage));
        } else {
            double delta = 0.;
            if (dto.getSize() != obj.getSize()) {
                delta = dto.getSize() - obj.getSize();
            }
            if ((oldStorage.getFullness() + delta) > oldStorage.getCapacity()) {
                throw new StorageCapacityException(String.format(
                        "New storage capacity exceeded. Available: %.2f, Required: %.2f",
                        oldStorage.getCapacity() - oldStorage.getFullness(),
                        delta));
            }
            oldStorage.setFullness(oldStorage.getFullness() + delta);
            storageRepo.save(oldStorage);
        }

        if (dto.getStorageId() != obj.getStorageId()) {
            obj.setStorageId(newStorageId);
        }
        if (dto.getAttributes() != obj.getAttributes()) {
            try {
                obj.setAttributes(dto.getAttributes());
            } catch (Exception ex) {
                throw new NotValidException("Invalid attributes");
            }
        }
        if (dto.getIsDecommissioned() != obj.isDecommissioned()) {
            obj.setDecommissioned(dto.getIsDecommissioned());
        }

        return objectRepo.save(obj);
    }

    @Transactional
    public void delete(UUID id) {
        if (!objectRepo.existsById(id)) {
            throw new NotFoundException("Object not found with id: " + id);
        }
        StorageObject object = objectRepo.findById(id).get();
        Storage storage = storageRepo.findById(object.getStorageId()).get();
        storage.setFullness(storage.getFullness()-object.getSize());
        storageRepo.save(storage);
        objectRepo.deleteById(id);
    }
}