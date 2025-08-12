package com.storage.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storage.exception.NotFoundException;
import com.storage.exception.NotValidException;
import com.storage.exception.StorageObjectException;
import com.storage.model.dto.StorageObjectCreate;
import com.storage.model.dto.StorageObjectUpdate;
import com.storage.model.objects.Storage;
import com.storage.model.objects.StorageObject;
import com.storage.model.objects.Template;
import com.storage.model.objects.Unit;
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.TemplateRepository;
import com.storage.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageObjectService {
    private final StorageObjectRepository objectRepo;
    private final StorageRepository storageRepo;
    private final UnitRepository unitRepo;
    private final TemplateRepository templateRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
        // validate input
        if (dto.getSize() <= 0) throw new NotValidException("size must be > 0");

        Storage storage = storageRepo.findByIdForUpdate(dto.getStorage_id())
                .orElseThrow(() -> new NotFoundException("storage not found"));

        Unit unit = unitRepo.findById(dto.getUnit_id())
                .orElseThrow(() -> new NotFoundException("unit not found"));

        Template template = templateRepo.findById(dto.getTemplate_id())
                .orElseThrow(() -> new NotFoundException("template not found"));

        Double current = objectRepo.sumSizesByStorageId(storage.getId());
        if (current == null) current = 0.0;
        double newSum = current + dto.getSize();
        if (newSum > storage.getCapacity()) {
            throw new NotValidException("storage capacity exceeded");
        }

        StorageObject obj = StorageObject.builder()
                .name(dto.getName())
                .size(dto.getSize())
                .storage(storage)
                .unit(unit)
                .template(template)
                .photoUrl(dto.getPhoto_url())
                .decommissioned(false)
                .build();

        try {
            if (dto.getAttributes() != null) {
                obj.setAttributes(objectMapper.writeValueAsString(dto.getAttributes()));
            }
        } catch (Exception ex) {
            throw new NotValidException("invalid attributes");
        }

        return objectRepo.save(obj);
    }

    @Transactional
    public StorageObject patch(UUID id, StorageObjectUpdate dto) {
        StorageObject obj = getById(id);

        Double delta = 0.;
        if (dto.getSize() != null) delta = dto.getSize() - obj.getSize();

        UUID targetStorageId = dto.getStorage_id() != null ? dto.getStorage_id() : obj.getStorage().getId();

        Storage targetStorage = storageRepo.findByIdForUpdate(targetStorageId)
                .orElseThrow(() -> new NotFoundException("storage not found"));

        Double current = objectRepo.sumSizesByStorageId(targetStorage.getId());
        if (current == null) current = 0.0;

        double newSum = current + delta;
        if (newSum > targetStorage.getCapacity()) {
            throw new NotValidException("storage capacity exceeded");
        }

        if (dto.getName() != null) obj.setName(dto.getName());
        if (dto.getSize() != null) obj.setSize(dto.getSize());
        if (dto.getStorage_id() != null) {
            Storage s = storageRepo.findById(dto.getStorage_id()).orElseThrow(() -> new NotFoundException("storage not found"));
            obj.setStorage(s);
        }
        if (dto.getAttributes() != null) {
            try {
                obj.setAttributes(objectMapper.writeValueAsString(dto.getAttributes()));
            } catch (Exception ex) {
                throw new NotValidException("invalid attributes");
            }
        }
        if (dto.getIs_decommissioned() != null) obj.setDecommissioned(dto.getIs_decommissioned());

        return objectRepo.save(obj);
    }

    @Transactional
    public void delete(UUID id) {
        if (!objectRepo.existsById(id)) throw new NotFoundException("object not found");
        objectRepo.deleteById(id);
    }
}