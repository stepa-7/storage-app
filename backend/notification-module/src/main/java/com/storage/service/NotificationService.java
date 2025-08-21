package com.storage.service;

import com.storage.model.StorageEvent;
import com.storage.model.StorageEventCreate;
import com.storage.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificationService {
    private EventRepository eventRepository;

    public StorageEvent add(StorageEventCreate storageEventCreate) {
        StorageEvent storageEvent = StorageEvent.builder()
                        .storageId(storageEventCreate.getStorageId())
                        .upperLimit(storageEventCreate.getUpperLimit())
                        .lowerLimit(storageEventCreate.getLowerLimit())
                        .build();

        return eventRepository.save(storageEvent);
    }

    public StorageEvent update(UUID uuid, StorageEventCreate storageEventCreate) { // можно также находить по storageId
        StorageEvent storageEvent = eventRepository.findById(uuid).orElseThrow(() -> new RuntimeException(""));
        storageEvent.setLowerLimit(storageEventCreate.getLowerLimit());
        storageEvent.setUpperLimit(storageEventCreate.getUpperLimit());
        return eventRepository.save(storageEvent);
    }

}
