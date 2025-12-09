package utm.server.modules.products.dto;

import utm.server.modules.image.dto.ImageUploadResponse;

import java.util.List;

public record ProductCreationDto(
                String title,
                String description,
                Long shopId,
                List<ImageUploadResponse> productImagesTemp,
                List<String> tags,
                double price) {
}
