package service;

import com.storage.exception.NotValidException;
import com.storage.model.dto.unit.UnitCreate;
import com.storage.model.entity.Storage;
import com.storage.model.entity.StorageObject;
import com.storage.model.entity.Unit;
import com.storage.repository.StorageObjectRepository;
import com.storage.repository.StorageRepository;
import com.storage.repository.UnitRepository;
import com.storage.service.impl.UnitServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UnitServiceImplTest {

    @Mock
    private UnitRepository unitRepo;

    @Mock
    private StorageObjectRepository objectRepo;

    @Mock
    private StorageRepository storageRepo;

    @InjectMocks
    private UnitServiceImpl unitService;

    private Unit testUnit;
    private UnitCreate unitCreate;
    private UUID testUuid;

    @BeforeEach
    void setUp() {
        testUuid = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

        testUnit = Unit.builder()
                .id(testUuid)
                .name("Kilogram")
                .symbol("kg")
                .build();

        unitCreate = new UnitCreate("Kilogram", "kg");
    }

    @Test
    void getAll_ShouldReturnListOfUnits() {
        // Arrange
        List<Unit> expectedUnits = List.of(testUnit);
        when(unitRepo.findAll()).thenReturn(expectedUnits);

        // Act
        List<Unit> result = unitService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testUnit, result.get(0));
        verify(unitRepo, times(1)).findAll();
    }

    @Test
    void getAll_WhenNoUnits_ShouldReturnEmptyList() {
        // Arrange
        when(unitRepo.findAll()).thenReturn(List.of());

        // Act
        List<Unit> result = unitService.getAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(unitRepo, times(1)).findAll();
    }

    @Test
    void create_WithValidData_ShouldCreateAndReturnUnit() {
        // Arrange
        when(unitRepo.save(any(Unit.class))).thenReturn(testUnit);

        // Act
        Unit result = unitService.create(unitCreate);

        // Assert
        assertNotNull(result);
        assertEquals(testUnit.getName(), result.getName());
        assertEquals(testUnit.getSymbol(), result.getSymbol());
        verify(unitRepo, times(1)).save(any(Unit.class));
    }

    @Test
    void create_WithNullName_ShouldCreateUnit() {
        // Arrange
        UnitCreate createWithNullName = new UnitCreate(null, "kg");
        Unit unitWithNullName = Unit.builder()
                .name(null)
                .symbol("kg")
                .build();

        when(unitRepo.save(any(Unit.class))).thenReturn(unitWithNullName);

        // Act
        Unit result = unitService.create(createWithNullName);

        // Assert
        assertNotNull(result);
        assertNull(result.getName());
        assertEquals("kg", result.getSymbol());
        verify(unitRepo, times(1)).save(any(Unit.class));
    }

    @Test
    void create_WithNullSymbol_ShouldCreateUnit() {
        // Arrange
        UnitCreate createWithNullSymbol = new UnitCreate("Kilogram", null);
        Unit unitWithNullSymbol = Unit.builder()
                .name("Kilogram")
                .symbol(null)
                .build();

        when(unitRepo.save(any(Unit.class))).thenReturn(unitWithNullSymbol);

        // Act
        Unit result = unitService.create(createWithNullSymbol);

        // Assert
        assertNotNull(result);
        assertEquals("Kilogram", result.getName());
        assertNull(result.getSymbol());
        verify(unitRepo, times(1)).save(any(Unit.class));
    }

    @Test
    void delete_WhenNoReferences_ShouldDeleteUnit() {
        // Arrange
        when(objectRepo.findByUnitId(testUuid)).thenReturn(List.of());
        when(storageRepo.findByUnitId(testUuid)).thenReturn(List.of());
        doNothing().when(unitRepo).deleteById(testUuid);

        // Act & Assert
        assertDoesNotThrow(() -> unitService.delete(testUuid));

        // Verify
        verify(objectRepo, times(1)).findByUnitId(testUuid);
        verify(storageRepo, times(1)).findByUnitId(testUuid);
        verify(unitRepo, times(1)).deleteById(testUuid);
    }

    @Test
    void delete_WhenObjectReferencesExist_ShouldThrowNotValidException() {
        // Arrange
        StorageObject mockObject1 = mock(StorageObject.class);
        StorageObject mockObject2 = mock(StorageObject.class);
        when(objectRepo.findByUnitId(testUuid)).thenReturn(List.of(mockObject1, mockObject2));

        // Act & Assert
        NotValidException exception = assertThrows(NotValidException.class,
                () -> unitService.delete(testUuid));

        assertEquals("Exists objects or storages what using this unit", exception.getMessage());

        // Verify
        verify(objectRepo, times(1)).findByUnitId(testUuid);
        verify(storageRepo, never()).findByUnitId(any());
        verify(unitRepo, never()).deleteById(any());
    }

    @Test
    void delete_WhenStorageReferencesExist_ShouldThrowNotValidException() {
        // Arrange
        Storage mockObject1 = mock(Storage.class);
        Storage mockObject2 = mock(Storage.class);
        // Arrange
        when(objectRepo.findByUnitId(testUuid)).thenReturn(List.of());
        when(storageRepo.findByUnitId(testUuid)).thenReturn(List.of(mockObject1, mockObject2)); // Any non-null object

        // Act & Assert
        NotValidException exception = assertThrows(NotValidException.class,
                () -> unitService.delete(testUuid));

        assertEquals("Exists objects or storages what using this unit", exception.getMessage());

        // Verify
        verify(objectRepo, times(1)).findByUnitId(testUuid);
        verify(storageRepo, times(1)).findByUnitId(testUuid);
        verify(unitRepo, never()).deleteById(any());
    }

    @Test
    void delete_WhenBothReferencesExist_ShouldThrowNotValidException() {
        // Arrange
        StorageObject mockObject1 = mock(StorageObject.class);
        StorageObject mockObject2 = mock(StorageObject.class);
        // Arrange
        when(objectRepo.findByUnitId(testUuid)).thenReturn(List.of(mockObject1, mockObject2));
        // storageRepo check won't be reached due to short-circuit logic

        // Act & Assert
        NotValidException exception = assertThrows(NotValidException.class,
                () -> unitService.delete(testUuid));

        assertEquals("Exists objects or storages what using this unit", exception.getMessage());

        // Verify
        verify(objectRepo, times(1)).findByUnitId(testUuid);
        verify(storageRepo, never()).findByUnitId(any());
        verify(unitRepo, never()).deleteById(any());
    }

    @Test
    void delete_WithNonExistentUnit_ShouldThrowException() {
        // Arrange
        UUID nonExistentUuid = UUID.fromString("00000000-0000-0000-0000-000000000000");
        when(objectRepo.findByUnitId(nonExistentUuid)).thenReturn(List.of());
        when(storageRepo.findByUnitId(nonExistentUuid)).thenReturn(List.of());
        doThrow(new RuntimeException("Unit not found")).when(unitRepo).deleteById(nonExistentUuid);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> unitService.delete(nonExistentUuid));

        // Verify
        verify(objectRepo, times(1)).findByUnitId(nonExistentUuid);
        verify(storageRepo, times(1)).findByUnitId(nonExistentUuid);
        verify(unitRepo, times(1)).deleteById(nonExistentUuid);
    }
}