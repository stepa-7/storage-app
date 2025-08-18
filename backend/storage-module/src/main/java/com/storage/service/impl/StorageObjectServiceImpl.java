package com.storage.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.TemplateRepository;
import com.storage.repository.UnitRepository;
import com.storage.service.FileImageService;
import com.storage.service.StorageObjectService;
import com.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
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

        if (!storageService.canAccommodate(dto.getStorageId(), dto.getSize())) {
            throw new StorageCapacityException("Storage capacity exceeded");
        }

        Storage storage = storageRepo.findByIdForUpdate(dto.getStorageId())
                .orElseThrow(() -> new NotFoundException("Storage not found with id: " + dto.getStorageId()));

        Unit unit = unitRepo.findById(dto.getUnitId())
                .orElseThrow(() -> new NotFoundException("Unit not found with id: " + dto.getUnitId()));

        Template template = templateRepo.findById(dto.getTemplateId())
                .orElseThrow(() -> new NotFoundException("Template not found with id: " + dto.getTemplateId()));

        if (dto.getPhotoUrl() != null && !fileImageService.exists(dto.getPhotoUrl())) {
            throw new NotFoundException("File not found in storage");
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

        try {
            if (dto.getAttributes() != null) {
                obj.setAttributes(dto.getAttributes());
            }
        } catch (Exception ex) {
            throw new NotValidException("Invalid attributes format");
        }

        storage.setFullness(storage.getFullness() + obj.getSize());
        storageRepo.save(storage);

        // TODO
//        checkNotificationRules(dto.storageId());

        return objectRepo.save(obj);
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

        if(newStorageId != null && !oldStorageId.equals(newStorageId)){
            double newSize = dto.getSize() != null ? dto.getSize() : obj.getSize();
            if (!storageService.canAccommodate(newStorageId, newSize)) {
                throw new StorageCapacityException(String.format(
                        "New storage capacity exceeded. Available: %.2f, Required: %.2f",
                        newStorage.getCapacity() - newStorage.getFullness(),
                        dto.getSize()));
            }

            oldStorage.setFullness(oldStorage.getFullness() - obj.getSize());
            newStorage.setFullness(newStorage.getFullness() + dto.getSize());
            storageRepo.saveAll(List.of(oldStorage, newStorage));
        } else {
//            double delta = 0.;
//            if (dto.getSize() != obj.getSize()) {
//                delta = dto.getSize() - obj.getSize();
//            }
//            if ((oldStorage.getFullness() + delta) > oldStorage.getCapacity()) {
//                throw new StorageCapacityException(String.format(
//                        "New storage capacity exceeded. Available: %.2f, Required: %.2f",
//                        oldStorage.getCapacity() - oldStorage.getFullness(),
//                        delta));
//            }
//            oldStorage.setFullness(oldStorage.getFullness() + delta);
            storageRepo.save(oldStorage);
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
//        storage.setFullness(storage.getFullness()-object.getSize());
        storageRepo.save(storage);
        objectRepo.deleteById(id);
    }

    @Transactional
    @Override
    public StorageObject createWithFile(StorageObjectCreateWithFileDto createWithFileDto) {
        MultipartFile fileName = createWithFileDto.getPhoto();
        if (fileName == null || fileName.isEmpty() || fileName.getOriginalFilename() == null) {
            throw new ImageUploadException("Image must have name and exist");
        }

        StorageObject object = create(StorageObjectCreate.builder()
                .name(createWithFileDto.getName())
                .size(createWithFileDto.getSize())
                .storageId(createWithFileDto.getStorageId())
                .unitId(createWithFileDto.getUnitId())
                .templateId(createWithFileDto.getTemplateId())
                .build());
        String url = fileImageService.upload(fileName);
        object.setPhotoUrl(url);

        return objectRepo.save(object);
//        return updateWithFile(id, StorageObjectUpdateWithFileDto.builder()
//                .name(createWithFileDto.getName())
//                .size(createWithFileDto.getSize())
//                .storageId(createWithFileDto.getStorageId())
//                .isDecommissioned(false)
//                .attributes(createWithFileDto.getAttributes())
//                .photo(createWithFileDto.getPhoto())
//                .build());
    }

    @Transactional
    @Override
    public StorageObject updateWithFile(UUID id, StorageObjectUpdateWithFileDto updateWithFileDto) {
        Map<String, Object> parsedAttributes = null;
        if (updateWithFileDto.getAttributes() != null) {
            try {
                parsedAttributes = new ObjectMapper().readValue(
                        updateWithFileDto.getAttributes(),
                        new TypeReference<Map<String, Object>>() {
                        });
            } catch (Exception e) {
                throw new NotValidException("Invalid attributes format");
            }
        }
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
}