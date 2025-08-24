package com.storage.service;

import com.storage.model.StorageEvent;
import com.storage.model.StorageEventCreate;
import com.storage.model.notification.StorageData;
import com.storage.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final EventRepository eventRepository;

    public List<StorageEvent> getAll(){
        return eventRepository.findAll();
    }

    public StorageEvent add(StorageEventCreate storageEventCreate) {
        if(!validateStorageEvent(storageEventCreate)){
            throw new RuntimeException("Event borders not valid");
        }
        StorageEvent storageEvent = StorageEvent.builder()
                        .storageId(storageEventCreate.getStorageId())
                        .upperLimit(storageEventCreate.getUpperLimit())
                        .lowerLimit(storageEventCreate.getLowerLimit())
                        .build();

        return eventRepository.save(storageEvent);
    }

    public StorageEvent update(UUID uuid, StorageEventCreate storageEventCreate) { // можно также находить по storageId
        if(!validateStorageEvent(storageEventCreate)){
            throw new RuntimeException("Event borders not valid");
        }
        StorageEvent storageEvent = eventRepository.findById(uuid).orElseThrow(() -> new RuntimeException(""));
        storageEvent.setLowerLimit(storageEventCreate.getLowerLimit());
        storageEvent.setUpperLimit(storageEventCreate.getUpperLimit());
        return eventRepository.save(storageEvent);
    }

    public void delete(UUID id) {
        eventRepository.deleteById(id);
    }

    public boolean validateStorageEvent(StorageEventCreate eventCreate){
        return eventCreate.getLowerLimit() <= eventCreate.getUpperLimit();
    }

    public Optional<String> checkRule(StorageData data) {
        if (eventRepository.existsByStorageId(data.getStorageId())) {
            StorageEvent event = eventRepository.getByStorageId(data.getStorageId())
                    .orElseThrow(() -> new RuntimeException("Event not found for storage"));

            double fullnessPercentage = (data.getFullness() / data.getCapacity()) * 100;

            if (fullnessPercentage < event.getLowerLimit()) {
                return Optional.of("Storage " + data.getStorageName() + " fullness is below " +
                        event.getLowerLimit() + "% (current: " + String.format("%.1f", fullnessPercentage) + "%)");
            }
            else if (fullnessPercentage > event.getUpperLimit()) {
                return Optional.of("Storage " + data.getStorageName() + " fullness is above " +
                        event.getUpperLimit() + "% (current: " + String.format("%.1f", fullnessPercentage) + "%)");
            }
        }
        return Optional.empty();
    }
}
