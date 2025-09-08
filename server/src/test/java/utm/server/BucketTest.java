package utm.server;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import utm.server.features.image.google_storage.BucketConfig;
import utm.server.features.image.google_storage.GoogleStorageImageService;

import java.io.ByteArrayInputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@org.junit.jupiter.api.extension.ExtendWith(MockitoExtension.class)
class GoogleStorageImageServiceTest {

    @Mock
    private Storage storage;

    @Mock
    private BucketConfig bucketConfig;

    @Mock
    private MultipartFile file;

    @InjectMocks
    private GoogleStorageImageService service;

    @BeforeEach
    void setup() {
        when(bucketConfig.getBucketName()).thenReturn("test-bucket");
    }

    @Test
    void upload_ShouldReturnGeneratedLink_WhenUploadSucceeds() throws Exception {
        // Arrange
        when(bucketConfig.getBucketName()).thenReturn("test-bucket");
        when(file.getOriginalFilename()).thenReturn("test.png");
        when(file.getBytes()).thenReturn("hello".getBytes());

        Blob blob = mock(Blob.class); // ✅ now Blob is recognized
        when(storage.create(any(BlobInfo.class), any(byte[].class))).thenReturn(blob);

        // Act
        String result = service.upload(file);

        // Assert
        assertThat(result).isNotNull();
        verify(storage).create(any(BlobInfo.class), any(byte[].class));
    }

    @Test
    void getLink_ShouldReturnSignedUrl() {
        String link = service.getLink("123.png");
        assertThat(link).isNotNull();
    }

    @Test
    void delete_ShouldCallStorageDelete() {
        when(storage.delete(any(BlobId.class))).thenReturn(true);

        boolean deleted = service.delete("123.png");

        assertThat(deleted).isTrue();
        verify(storage).delete(any(BlobId.class));
    }

    @Test
    void exists_ShouldCallStorageGet() {
        Blob blob = mock(Blob.class);
        when(storage.get(any(BlobId.class))).thenReturn(blob);

        boolean exists = service.exists("123.png");

        assertThat(exists).isTrue();
        verify(storage).get(any(BlobId.class));
    }
}
