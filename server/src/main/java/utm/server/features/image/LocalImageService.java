package utm.server.features.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

public class LocalImageService implements ImageService {

    @Value("${localimageuploads.url}")
    private String baseDir;

    @Override
    public String upload(MultipartFile file) {
        return "";
    }

    @Override
    public String getLink(String imageId) {
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
