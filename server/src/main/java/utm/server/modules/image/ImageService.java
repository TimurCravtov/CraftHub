package utm.server.modules.image;

import org.springframework.web.multipart.MultipartFile;
import utm.server.modules.image.dto.ImageUploadResponse;

import java.time.Duration;

public interface ImageService {

    Duration standardLinkDuration = Duration.ofMinutes(15);

    String getPermanentLink(String imageId);
    ImageUploadResponse upload(MultipartFile file, boolean isPublic, boolean isTemp);

    ImageUploadResponse confirmUpload(String tempObjectKey);

    boolean delete(String imageId);
    boolean exists(String imageId);
}
