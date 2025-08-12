package com.storage.repository;

import com.storage.model.objects.StorageObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StorageObjectRepository extends JpaRepository<StorageObject, UUID> {
    List<StorageObject> findByStorageId(UUID storageId);
    List<StorageObject> findByTemplateId(UUID templateId);
    List<StorageObject> findByDecommissioned(boolean decommissioned);

    @Query("select coalesce(sum(so.size), 0) from StorageObject so where so.storage.id = :storageId and so.decommissioned = false")
    Double sumSizesByStorageId(@Param("storageId") UUID storageId);
}

