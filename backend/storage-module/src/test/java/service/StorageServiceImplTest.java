package service;

import com.storage.config.UserContext;
import com.storage.exception.NotFoundException;
import com.storage.exception.StorageNotEmptyException;
import com.storage.model.dto.storage.StorageCreate;
import com.storage.model.dto.storage.StorageUpdate;
import com.storage.model.entity.Storage;
import com.storage.model.notification.StorageData;
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.UnitRepository;
import com.storage.service.impl.StorageServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.*;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
class StorageServiceImplTest {

    @Mock private StorageRepository storageRepository;
    @Mock private StorageObjectRepository objectRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private KafkaTemplate<String, StorageData> kafkaTemplate;
    @Mock private UserContext userContext;

    @InjectMocks
    private StorageServiceImpl storageService;

    private UUID storageId;
    private Storage storage;

    @BeforeEach
    void setUp() {
        storageId = UUID.randomUUID();
        storage = Storage.builder()
                .id(storageId)
                .name("Test Storage")
                .capacity(100.0)
                .unitId(UUID.randomUUID())
                .parentId(null)
                .createdBy(UUID.randomUUID())
                .fullness(10.0)
                .build();
    }

    @Test
    void getAll_noParentId_returnsAllStorages() {
        when(storageRepository.findByIsDeletedFalse()).thenReturn(List.of(storage));

        List<Storage> result = storageService.getAll(null);

        assertEquals(1, result.size());
        verify(storageRepository).findByIsDeletedFalse();
    }

    @Test
    void getById_found_returnsStorage() {
        when(storageRepository.findByIdAndIsDeletedFalse(storageId)).thenReturn(Optional.of(storage));

        Storage result = storageService.getById(storageId);

        assertEquals(storage, result);
    }

    @Test
    void getById_notFound_throwsException() {
        when(storageRepository.findByIdAndIsDeletedFalse(storageId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> storageService.getById(storageId));
    }

    @Test
    void create_withValidData_savesStorage() {
        StorageCreate dto = new StorageCreate("New Storage", 50.0, storage.getUnitId(), null);

        when(unitRepository.existsById(dto.getUnitId())).thenReturn(true);
        when(userContext.getCurrentUserId()).thenReturn(UUID.randomUUID());
        when(storageRepository.save(any(Storage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Storage result = storageService.create(dto);

        assertEquals("New Storage", result.getName());
        verify(storageRepository).save(any(Storage.class));
    }

    @Test
    void create_unitNotFound_throwsException() {
        StorageCreate dto = new StorageCreate("Invalid", 50.0, UUID.randomUUID(), null);

        when(unitRepository.existsById(dto.getUnitId())).thenReturn(false);

        assertThrows(NotFoundException.class, () -> storageService.create(dto));
    }

    @Test
    void update_changesCapacity_savesStorage() {
        StorageUpdate dto = new StorageUpdate("Updated", 200.0, null);

        when(storageRepository.findByIdAndIsDeletedFalse(storageId)).thenReturn(Optional.of(storage));
        when(storageRepository.save(any(Storage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userContext.getMail()).thenReturn("test@mail.com");
        when(userContext.getCurrentUserId()).thenReturn(UUID.randomUUID());
        when(kafkaTemplate.send(anyString(), anyString(), any(StorageData.class)))
                .thenReturn(CompletableFuture.completedFuture(mock(SendResult.class)));

        Storage result = storageService.update(storageId, dto);

        assertEquals("Updated", result.getName());
        assertEquals(200.0, result.getCapacity());
        verify(storageRepository).save(result);
    }

    @Test
    void delete_withChildren_throwsException() {
        when(storageRepository.findByIdAndIsDeletedFalse(storageId)).thenReturn(Optional.of(storage));
        when(storageRepository.existsByParentIdAndIsDeletedFalse(storageId)).thenReturn(true);

        assertThrows(StorageNotEmptyException.class, () -> storageService.delete(storageId));
    }

    @Test
    void delete_withoutChildrenAndObjects_marksAsDeleted() {
        when(storageRepository.findByIdAndIsDeletedFalse(storageId)).thenReturn(Optional.of(storage));
        when(storageRepository.existsByParentIdAndIsDeletedFalse(storageId)).thenReturn(false);
        when(objectRepository.existsByStorageIdAndDecommissionedFalse(storageId)).thenReturn(false);

        storageService.delete(storageId);

        assertTrue(storage.isDeleted());
        verify(storageRepository).save(storage);
    }

    @Test
    void canAccommodate_trueIfEnoughSpace() {
        when(storageRepository.findByIdAndIsDeletedFalse(storageId)).thenReturn(Optional.of(storage));
        when(objectRepository.sumSizesByStorageId(storageId)).thenReturn(Optional.of(10.0));

        boolean result = storageService.canAccommodate(storageId, 50.0);

        assertTrue(result);
    }

    @Test
    void canAccommodate_falseIfNotEnoughSpace() {
        when(storageRepository.findByIdAndIsDeletedFalse(storageId)).thenReturn(Optional.of(storage));
        when(objectRepository.sumSizesByStorageId(storageId)).thenReturn(Optional.of(90.0));

        boolean result = storageService.canAccommodate(storageId, 20.0);

        assertFalse(result);
    }

    @Test
    void isCircularReference_detectsSelfReference() {
        Storage parent = Storage.builder().id(storageId).build();

        boolean result = storageService.isCircularReference(storage, parent);

        assertTrue(result);
    }
}
