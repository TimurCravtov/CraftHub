package utm.server.features.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

public class LocalImageService implements ImageService {

    @Value("${localimageuploads.url}")
    private String baseDir;

    public String upload(MultipartFile file) {
        return "";
    }

    @Override
    public String moveToPermanent(String tempKey) {
        return "";
    }

    @Override
    public String uploadTemp(MultipartFile file) {
        return "";
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
