package utm.server.features.products.dto;

import org.springframework.web.multipart.MultipartFile;
import utm.server.features.image.dto.ImageUploadResponse;

import java.util.List;

public record ProductCreationDto(
        String title,
        String description,
        Long shopId,
        List<ImageUploadResponse> productImagesTemp,
        double price) {
}

