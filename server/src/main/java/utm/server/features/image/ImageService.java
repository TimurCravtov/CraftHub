package utm.server.features.image;

import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

public interface ImageService {

    Duration standardLinkDuration = Duration.ofMinutes(15);

    String moveToPermanent(String tempKey);

    String uploadTemp(MultipartFile file);

    String upload(MultipartFile file, boolean isPublic);
    String getSignedLink(String imageId, Duration duration);
    String getPermanentLink(String imageId);
    default String uploadPublicAndGetPermanentLink(MultipartFile file) {
        String key = upload(file, true);
        return getPermanentLink(key);
    }
    boolean delete(String imageId);
    boolean exists(String imageId);
}
