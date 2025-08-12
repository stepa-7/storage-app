package com.storage.repository;

import com.storage.model.objects.Storage;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StorageRepository extends JpaRepository<Storage, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Storage s where s.id = :id")
    Optional<Storage> findByIdForUpdate(@Param("id") UUID id);
}
