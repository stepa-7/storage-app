package com.storage.repository;

import com.storage.model.StorageEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<StorageEvent, UUID> {
    Optional<StorageEvent> getByStorageId(UUID storageId);
    Boolean existsByStorageId(UUID storageId);
}
