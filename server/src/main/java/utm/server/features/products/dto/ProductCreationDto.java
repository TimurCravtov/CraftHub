package utm.server.features.products.dto;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record ProductCreationDto(
        String title,
        String description,
        Long shopId,
        List<String> productImagesTemp,
        double price) {
}

