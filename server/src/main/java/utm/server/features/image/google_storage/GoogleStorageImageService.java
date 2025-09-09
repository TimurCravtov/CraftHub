package utm.server.features.image.google_storage;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import utm.server.features.image.ImageService;

import java.io.IOException;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class GoogleStorageImageService implements ImageService {

    private final Storage storage;
    private final BucketConfig bucketConfig;

    @SneakyThrows
    public String upload(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File must have a name");
        }

        BlobInfo blobInfo = BlobInfo.newBuilder(bucketConfig.getBucketName(), fileName).build();
        storage.create(blobInfo, file.getBytes());

        return String.format("gs://%s/%s", bucketConfig.getBucketName(), fileName);
    }

    @Override
    public String upload(MultipartFile file, boolean isPublic) {
        return "";
    }

    @Override
    public String getSignedLink(String imageId, Duration duration) {
        return "";
    }

    @Override
    public String getPermanentLink(String imageId) {
        return "";
    }


    public String getSignedLink(String imageId) {
        return "";
    }

    @Override
    public boolean delete(String imageId) {
        return false;
    }

    @Override
    public boolean exists(String imageId) {
        return false;
    }
}
