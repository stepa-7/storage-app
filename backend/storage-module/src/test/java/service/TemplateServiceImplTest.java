package service;

import com.storage.exception.NotFoundException;
import com.storage.model.dto.template.TemplateCreate;
import com.storage.model.dto.template.TemplateUpdate;
import com.storage.model.entity.Template;
import com.storage.repository.TemplateRepository;
import com.storage.service.impl.TemplateServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TemplateServiceImplTest {

    private TemplateRepository repo;
    private TemplateServiceImpl service;

    @BeforeEach
    void setUp() {
        repo = mock(TemplateRepository.class);
        service = new TemplateServiceImpl(repo);
    }

    @Test
    void getAll_filtersByIsDeletedAndName() {
        Template t1 = Template.builder().id(UUID.randomUUID()).name("DocA").isDeleted(false).build();
        Template t2 = Template.builder().id(UUID.randomUUID()).name("DocB").isDeleted(true).build();
        Template t3 = Template.builder().id(UUID.randomUUID()).name("Report").isDeleted(false).build();

        when(repo.findAll()).thenReturn(List.of(t1, t2, t3));


        List<Template> notDeleted = service.getAll(false, null);
        assertEquals(2, notDeleted.size());
        assertTrue(notDeleted.stream().allMatch(t -> !t.isDeleted()));


        List<Template> docs = service.getAll(null, "Doc");
        assertEquals(2, docs.size());
        assertTrue(docs.stream().allMatch(t -> t.getName().contains("Doc")));


        List<Template> docsNotDeleted = service.getAll(false, "Doc");
        assertEquals(1, docsNotDeleted.size());
        assertEquals("DocA", docsNotDeleted.get(0).getName());
    }

    @Test
    void create_savesTemplate() {
        TemplateCreate dto = new TemplateCreate("My Template", "Desc", Map.of());

        Template saved = Template.builder()
                .id(UUID.randomUUID())
                .name(dto.getName())
                .description(dto.getDescription())
                .schema(dto.getSchema())
                .build();

        when(repo.save(any(Template.class))).thenReturn(saved);

        Template result = service.create(dto);

        assertNotNull(result.getId());
        assertEquals(dto.getName(), result.getName());
        verify(repo, times(1)).save(any(Template.class));
    }

    @Test
    void get_returnsTemplateIfExists() {
        UUID id = UUID.randomUUID();
        Template t = Template.builder().id(id).name("Test").build();

        when(repo.findById(id)).thenReturn(Optional.of(t));

        Template result = service.get(id);

        assertEquals(id, result.getId());
    }

    @Test
    void get_throwsIfNotFound() {
        UUID id = UUID.randomUUID();
        when(repo.findById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.get(id));
    }

    @Test
    void patch_updatesFieldsAndSaves() {
        UUID id = UUID.randomUUID();
        Template existing = Template.builder()
                .id(id).name("Old").description("OldDesc").isDeleted(false)
                .build();

        TemplateUpdate dto = new TemplateUpdate("NewName", "NewDesc", true);

        when(repo.findById(id)).thenReturn(Optional.of(existing));
        when(repo.save(any(Template.class))).thenAnswer(inv -> inv.getArgument(0));

        Template updated = service.patch(id, dto);

        assertEquals("NewName", updated.getName());
        assertEquals("NewDesc", updated.getDescription());
        assertTrue(updated.isDeleted());
        verify(repo).save(existing);
    }

    @Test
    void patch_updatesOnlyNonNullFields() {
        UUID id = UUID.randomUUID();
        Template existing = Template.builder()
                .id(id).name("KeepName").description("KeepDesc").isDeleted(false)
                .build();

        TemplateUpdate dto = new TemplateUpdate(null, null, true);

        when(repo.findById(id)).thenReturn(Optional.of(existing));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Template updated = service.patch(id, dto);

        assertEquals("KeepName", updated.getName());
        assertEquals("KeepDesc", updated.getDescription());
        assertTrue(updated.isDeleted());
    }

    @Test
    void markDeleted_setsDeletedTrueAndSaves() {
        UUID id = UUID.randomUUID();
        Template existing = Template.builder()
                .id(id).name("MarkMe").isDeleted(false).build();

        when(repo.findById(id)).thenReturn(Optional.of(existing));
        when(repo.save(any(Template.class))).thenAnswer(inv -> inv.getArgument(0));

        service.markDeleted(id);

        assertTrue(existing.isDeleted());
        verify(repo).save(existing);
    }
}