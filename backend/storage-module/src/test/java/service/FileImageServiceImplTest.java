package service;

import com.storage.exception.ImageUploadException;
import com.storage.service.impl.FileImageServiceImpl;
import com.storage.service.props.MinioProperties;
import io.minio.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FileImageServiceImplTest {

    private MinioClient minioClient;
    private MinioProperties minioProperties;
    private FileImageServiceImpl fileImageService;

    @BeforeEach
    void setUp() {
        minioClient = mock(MinioClient.class);
        minioProperties = new MinioProperties();
        minioProperties.setBucket("test-bucket");

        fileImageService = new FileImageServiceImpl(minioClient, minioProperties);
    }

    @Test
    void upload_success() throws Exception {
        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getOriginalFilename()).thenReturn("test.png");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("data".getBytes()));

        // bucketExists -> false => create bucket
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(false);

        String fileName = fileImageService.upload(multipartFile);

        assertNotNull(fileName);
        assertTrue(fileName.endsWith(".png"));

        // verify bucket creation
        verify(minioClient, times(1)).makeBucket(any(MakeBucketArgs.class));
        // verify file save
        verify(minioClient, times(1)).putObject(any(PutObjectArgs.class));
    }

    @Test
    void upload_failOnBucketCreation() throws Exception {
        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("data".getBytes()));

        when(minioClient.bucketExists(any())).thenThrow(new RuntimeException("connection error"));

        assertThrows(ImageUploadException.class, () -> fileImageService.upload(multipartFile));
    }

    @Test
    void upload_failOnInputStream() throws Exception {
        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getInputStream()).thenThrow(new RuntimeException("stream error"));

        when(minioClient.bucketExists(any())).thenReturn(true);

        assertThrows(ImageUploadException.class, () -> fileImageService.upload(multipartFile));
    }

    @Test
    void getObject_success() throws Exception {
        String fileName = "file123.png";
        byte[] data = "hello".getBytes();
        GetObjectResponse response = Mockito.mock(GetObjectResponse.class);
        when(response.readAllBytes()).thenReturn(data);
        when(minioClient.getObject(any())).thenReturn(response);

        byte[] result = fileImageService.getObject(fileName);

        assertArrayEquals(data, result);
    }

    @Test
    void getObject_fail() throws Exception {
        when(minioClient.getObject(any(GetObjectArgs.class)))
                .thenThrow(new RuntimeException("not found"));

        assertThrows(RuntimeException.class, () -> fileImageService.getObject("missing.png"));
    }

    @Test
    void exists_true() throws Exception {
        // Create a mock StatObjectResponse
        StatObjectResponse statResponse = Mockito.mock(StatObjectResponse.class);

        when(minioClient.statObject(any(StatObjectArgs.class))).thenReturn(statResponse);

        boolean exists = fileImageService.exists("file.png");

        assertTrue(exists);
    }

    @Test
    void exists_false() throws Exception {
        doThrow(new RuntimeException("not found"))
                .when(minioClient).statObject(any(StatObjectArgs.class));

        boolean exists = fileImageService.exists("file.png");

        assertFalse(exists);
    }
}