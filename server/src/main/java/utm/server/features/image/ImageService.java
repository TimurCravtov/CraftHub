package utm.server.features.image;

import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

public interface ImageService {

    Duration standardLinkDuration = Duration.ofMinutes(15);

    /**
     * @param file The file to upload
     * @return Filename of the file stored in service
     */
    String upload(MultipartFile file, boolean isPublic);
    String getSignedLink(String imageId, Duration duration);
    String getPermanentLink(String imageId);

    boolean delete(String imageId);
    boolean exists(String imageId);
}
