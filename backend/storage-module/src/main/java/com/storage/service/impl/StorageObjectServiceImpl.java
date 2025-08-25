package com.storage.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storage.config.UserContext;
import com.storage.exception.ImageUploadException;
import com.storage.exception.NotFoundException;
import com.storage.exception.NotValidException;
import com.storage.exception.StorageCapacityException;
import com.storage.model.dto.storage_object.StorageObjectCreate;
import com.storage.model.dto.storage_object.StorageObjectCreateWithFileDto;
import com.storage.model.dto.storage_object.StorageObjectUpdate;
import com.storage.model.dto.storage_object.StorageObjectUpdateWithFileDto;
import com.storage.model.entity.Storage;
import com.storage.model.entity.StorageObject;
import com.storage.model.entity.Template;
import com.storage.model.entity.Unit;
import com.storage.model.notification.StorageData;
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.TemplateRepository;
import com.storage.repository.UnitRepository;
import com.storage.service.FileImageService;
import com.storage.service.StorageObjectService;
import com.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageObjectServiceImpl implements StorageObjectService {
    private final StorageObjectRepository objectRepo;
    private final StorageRepository storageRepo;
    private final UnitRepository unitRepo;
    private final TemplateRepository templateRepo;
    private final FileImageService fileImageService;
    private final StorageService storageService;
    private final KafkaTemplate<String, StorageData> kafkaTemplate;
    private final UserContext userContext;

    @Override
    public List<StorageObject> find(UUID storageId, UUID templateId, Boolean decommissioned) {
        if (storageId != null) return objectRepo.findByStorageId(storageId);
        if (templateId != null) return objectRepo.findByTemplateId(templateId);
        if (decommissioned != null) return objectRepo.findByDecommissioned(decommissioned);
        return objectRepo.findAll();
    }

    @Override
    public StorageObject getById(UUID id) {
        return objectRepo.findById(id).orElseThrow(() -> new NotFoundException("object not found"));
    }

    @Transactional
    @Override
    public StorageObject create(StorageObjectCreate dto) {
        Storage storage = storageRepo.findByIdForUpdate(dto.getStorageId())
                .orElseThrow(() -> new NotFoundException("Storage not found with id: " + dto.getStorageId()));

        double delta = dto.getSize();
        checkAccommodation(storage, dto.getSize(), delta);

        Unit unit = unitRepo.findById(dto.getUnitId())
                .orElseThrow(() -> new NotFoundException("Unit not found with id: " + dto.getUnitId()));

        Template template = templateRepo.findById(dto.getTemplateId())
                .orElseThrow(() -> new NotFoundException("Template not found with id: " + dto.getTemplateId()));

        if (dto.getPhotoUrl() != null && !fileImageService.exists(dto.getPhotoUrl())) {
            throw new NotFoundException("File not found in storage");
        }

        UUID currentUserId = userContext.getCurrentUserId();

        StorageObject obj = StorageObject.builder()
                .name(dto.getName())
                .size(dto.getSize())
                .storageId(storage.getId())
                .unitId(unit.getId())
                .templateId(template.getId())
                .photoUrl(dto.getPhotoUrl())
                .decommissioned(false)
                .createdBy(currentUserId)
                .build();

        try {
            if (dto.getAttributes() != null) {
                obj.setAttributes(dto.getAttributes());
            }
        } catch (Exception ex) {
            throw new NotValidException("Invalid attributes format");
        }

        storage.setFullness(storage.getFullness() + obj.getSize());
        storageRepo.save(storage);

        sendData(storage);
        return objectRepo.save(obj);
    }

    @Transactional
    @Override
    public StorageObject createWithFile(StorageObjectCreateWithFileDto createWithFileDto) {

        Storage storage = storageRepo.findByIdForUpdate(createWithFileDto.getStorageId())
                .orElseThrow(() -> new NotFoundException("Storage not found with id: " + createWithFileDto.getStorageId()));

        double delta = createWithFileDto.getSize();
        checkAccommodation(storage, createWithFileDto.getSize(), delta);

        MultipartFile fileName = createWithFileDto.getPhoto();
        if (fileName == null || fileName.isEmpty() || fileName.getOriginalFilename() == null) {
            throw new ImageUploadException("Image must have name and exist");
        }
        String url = fileImageService.upload(fileName);

        Map<String, Object> parsedAttributes = parseAttributes(createWithFileDto.getAttributes());

        StorageObject object = StorageObject.builder()
                .name(createWithFileDto.getName())
                .size(createWithFileDto.getSize())
                .storageId(createWithFileDto.getStorageId())
                .unitId(createWithFileDto.getUnitId())
                .templateId(createWithFileDto.getTemplateId())
                .photoUrl(url)
                .attributes(parsedAttributes)
                .decommissioned(false)
                .createdBy(userContext.getCurrentUserId())
                .build();

        return objectRepo.save(object);
    }

    private Map<String, Object> parseAttributes(String attributes) {
        Map<String, Object> parsedAttributes = null;
        if (attributes != null) {
            try {
                parsedAttributes = new ObjectMapper().readValue(
                        attributes,
                        new TypeReference<Map<String, Object>>() {
                        });
            } catch (Exception e) {
                throw new NotValidException("Invalid attributes format");
            }
        }
        return parsedAttributes;
    }

    @Transactional
    @Override
    public StorageObject patch(UUID id, StorageObjectUpdate dto) {
        StorageObject obj = getById(id);

        UUID oldStorageId = obj.getStorageId();
        UUID newStorageId = dto.getStorageId();

        Storage oldStorage = storageRepo.findByIdForUpdate(oldStorageId)
                .orElseThrow(() -> new NotFoundException("Old parent storage not found"));
        Storage newStorage = storageRepo.findByIdForUpdate(newStorageId)
                .orElseThrow(() -> new NotFoundException("New parent storage not found"));

        double newSize = dto.getSize() != null ? dto.getSize() : obj.getSize();
        if (newStorageId != null && !oldStorageId.equals(newStorageId)) {
            double delta = newSize;
            checkAccommodation(newStorage, newSize, delta);
            oldStorage.setFullness(oldStorage.getFullness() - obj.getSize());
            newStorage.setFullness(newStorage.getFullness() + dto.getSize());
            storageRepo.saveAll(List.of(oldStorage, newStorage));

            sendData(oldStorage);
            sendData(newStorage);
        } else {
            double delta = newSize - obj.getSize();
            checkAccommodation(oldStorage, dto.getSize(), delta);
            oldStorage.setFullness(oldStorage.getFullness() + delta);
            storageRepo.save(oldStorage);

            sendData(oldStorage);
        }

        if (!dto.getName().equals(dto.getName())) {
            obj.setName(dto.getName());
        }
        if (dto.getSize() != obj.getSize()) {
            obj.setSize(dto.getSize());
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
        if (dto.getIsDecommissioned() != null
                && dto.getIsDecommissioned() != obj.isDecommissioned()) {
            obj.setDecommissioned(dto.getIsDecommissioned());
        }

        return objectRepo.save(obj);
    }

    @Transactional
    @Override
    public void delete(UUID id) {
        if (!objectRepo.existsById(id)) {
            throw new NotFoundException("Object not found with id: " + id);
        }
        StorageObject object = objectRepo.findById(id).get();
        Storage storage = storageRepo.findById(object.getStorageId()).get();

        storage.setFullness(Math.max(0, storage.getFullness() - object.getSize()));

        storageRepo.save(storage);
        objectRepo.deleteById(id);
        sendData(storage);
    }

    @Override
    public void checkAccommodation(Storage storage, Double size, Double delta) {
        if (!storageService.canAccommodate(storage.getId(), delta)) {
            double availableSize = storage.getCapacity() - storage.getFullness();
            throw new StorageCapacityException(String.format(
                    "New storage capacity exceeded. Available: %.2f, Required: %.2f",
                    availableSize,
                    size - availableSize));
        }
    }

    @Transactional
    @Override
    public StorageObject updateWithFile(UUID id, StorageObjectUpdateWithFileDto updateWithFileDto) {
        Map<String, Object> parsedAttributes = parseAttributes(updateWithFileDto.getAttributes());

        StorageObject updated = patch(id, StorageObjectUpdate.builder()
                .name(updateWithFileDto.getName())
                .size(updateWithFileDto.getSize())
                .storageId(updateWithFileDto.getStorageId())
                .attributes(parsedAttributes)
                .isDecommissioned(updateWithFileDto.getIsDecommissioned())
                .build());

        MultipartFile photo = updateWithFileDto.getPhoto();
        if (photo != null && !photo.isEmpty()) {
            String newFileName = fileImageService.upload(photo);
            updated.setPhotoUrl(newFileName);
        }

        return objectRepo.save(updated);
    }

    private void sendData(Storage storage) {
        String userEmail = userContext.getMail();
        UUID userId = userContext.getCurrentUserId();

        StorageData event = StorageData.builder()
                .storageId(storage.getId())
                .storageName(storage.getName())
                .fullness(storage.getFullness())
                .capacity(storage.getCapacity())
                .userEmail(userEmail)
                .userId(userId)
                .build();
        try {
            kafkaTemplate.send("storage-notification", event);
        } catch (RuntimeException e) {
            throw new RuntimeException("Can't send notification data");
        }
    }
}