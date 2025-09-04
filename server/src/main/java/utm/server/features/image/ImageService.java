package utm.server.features.image;

import org.springframework.web.multipart.MultipartFile;

public interface ImageService {
    String upload(MultipartFile file);
    String getLink(String imageId);
    boolean delete(String imageId);
    boolean exists(String imageId);
}
