package com.storage.service;

import com.storage.model.StorageData;
import com.storage.model.StorageEvent;
import com.storage.model.StorageEventCreate;
import com.storage.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {
    private EventRepository eventRepository;

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
        if(eventRepository.existsByStorageId(data.getStorageId())){
            StorageEvent event = eventRepository.getByStorageId(data.getStorageId()).get();
            Double limit = data.getFullness() / data.getCapacity();
            if (event.getLowerLimit() > limit){
                return Optional.of("Storage " + data.getStorageName() + "fullness below " + event.getLowerLimit() + "%") ;
            }
            else if(event.getUpperLimit() < limit) {
                return Optional.of("Storage " + data.getStorageName() + "fullness is higher " + event.getUpperLimit() + "%") ;
            }
        }
        return Optional.empty();
    }
}
