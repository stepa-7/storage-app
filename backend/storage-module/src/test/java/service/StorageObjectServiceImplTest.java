package service;

import com.storage.config.UserContext;
import com.storage.exception.ImageUploadException;
import com.storage.exception.NotFoundException;
import com.storage.exception.StorageCapacityException;
import com.storage.model.dto.storage_object.*;
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
import com.storage.service.StorageService;
import com.storage.service.impl.StorageObjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class StorageObjectServiceImplTest {

    @Mock private StorageObjectRepository objectRepo;
    @Mock private StorageRepository storageRepo;
    @Mock private UnitRepository unitRepo;
    @Mock private TemplateRepository templateRepo;
    @Mock private FileImageService fileImageService;
    @Mock private StorageService storageService;
    @Mock private KafkaTemplate<String, StorageData> kafkaTemplate;
    @Mock private UserContext userContext;

    @InjectMocks
    private StorageObjectServiceImpl service;

    private UUID storageId;
    private UUID unitId;
    private UUID templateId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        storageId = UUID.randomUUID();
        unitId = UUID.randomUUID();
        templateId = UUID.randomUUID();
        userId = UUID.randomUUID();

        //when(userContext.getCurrentUserId()).thenReturn(userId);
        //when(userContext.getMail()).thenReturn("user@test.com");
    }

    @Test
    void findByStorageId() {
        when(objectRepo.findByStorageId(storageId)).thenReturn(List.of(new StorageObject()));
        assertEquals(1, service.find(storageId, null, null).size());
    }

    @Test
    void getById_Found() {
        StorageObject obj = StorageObject.builder().id(UUID.randomUUID()).build();
        when(objectRepo.findById(obj.getId())).thenReturn(Optional.of(obj));

        StorageObject result = service.getById(obj.getId());

        assertEquals(obj, result);
    }

    @Test
    void getById_NotFound() {
        UUID id = UUID.randomUUID();
        when(objectRepo.findById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.getById(id));
    }

    @Test
    void create_Success() {
        Storage storage = Storage.builder().id(storageId).capacity(100).fullness(10).build();
        Unit unit = Unit.builder().id(unitId).build();
        Template template = Template.builder().id(templateId).build();

        StorageObjectCreate dto = StorageObjectCreate.builder()
                .name("TestObj")
                .size(20.0)
                .storageId(storageId)
                .unitId(unitId)
                .templateId(templateId)
                .build();

        when(storageRepo.findByIdForUpdate(storageId)).thenReturn(Optional.of(storage));
        when(unitRepo.findById(unitId)).thenReturn(Optional.of(unit));
        when(templateRepo.findById(templateId)).thenReturn(Optional.of(template));
        when(storageService.canAccommodate(storageId, dto.getSize())).thenReturn(true);
        when(objectRepo.save(any(StorageObject.class))).thenAnswer(inv -> inv.getArgument(0));

        StorageObject result = service.create(dto);

        assertEquals("TestObj", result.getName());
        verify(storageRepo).save(storage);
        verify(kafkaTemplate).send(eq("storage-notification"), any(StorageData.class));
    }

    @Test
    void create_StorageNotFound() {
        StorageObjectCreate dto = StorageObjectCreate.builder()
                .storageId(storageId)
                .unitId(unitId)
                .templateId(templateId)
                .size(10.0)
                .build();

        when(storageRepo.findByIdForUpdate(storageId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.create(dto));
    }

    @Test
    void createWithFile_NoFile_ShouldThrow() {
        StorageObjectCreateWithFileDto dto = StorageObjectCreateWithFileDto.builder()
                .storageId(storageId)
                .size(10.0)
                .photo(null)
                .build();

        Storage storage = Storage.builder().id(storageId).capacity(100).fullness(0).build();
        when(storageRepo.findByIdForUpdate(storageId)).thenReturn(Optional.of(storage));
        when(storageService.canAccommodate(storageId, 10.0)).thenReturn(true);
        when(templateRepo.findById(any())).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.createWithFile(dto));
    }


    @Test
    void checkAccommodation_NotEnoughCapacity_ShouldThrow() {
        Storage storage = Storage.builder().id(storageId).capacity(50).fullness(50).build();
        when(storageService.canAccommodate(storageId, 20.0)).thenReturn(false);

        assertThrows(StorageCapacityException.class,
                () -> service.checkAccommodation(storage, 20.0, 20.0));
    }

    @Test
    void delete_ObjectNotFound_ShouldThrow() {
        UUID id = UUID.randomUUID();
        when(objectRepo.existsById(id)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> service.delete(id));
    }
}