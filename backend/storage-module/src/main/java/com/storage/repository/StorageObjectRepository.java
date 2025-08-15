package com.storage.repository;

import com.storage.model.entity.StorageObject;
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
    List<StorageObject> findByUnitId(UUID unitId);
    List<StorageObject> findByDecommissioned(boolean decommissioned);

    void deleteByStorageId(UUID storageId);

    @Query("select coalesce(sum(so.size), 0) from StorageObject so where so.storageId = :storageId and so.decommissioned = false")
    Double sumSizesByStorageId(@Param("storageId") UUID storageId);
}

