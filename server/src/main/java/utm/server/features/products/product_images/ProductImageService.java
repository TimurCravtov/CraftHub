package utm.server.features.products.product_images;

import org.springframework.stereotype.Service;
import utm.server.features.image.dto.ImageUploadResponse;
import utm.server.features.products.Product;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductImageRepository repository;

    public List<ProductImageEntity> saveAll(List<ImageUploadResponse> images, Product product) {
        List<ProductImageEntity> entities = IntStream.range(0, images.size())
                .mapToObj(i -> ProductImageEntity.builder()
                        .product(product)
                        .key(images.get(i).key())
                        .orderNumber(i + 1)
                        .build())
                .collect(Collectors.toList());

        return repository.saveAll(entities);
    }

    public List<ProductImageEntity> findAllByProductId(Long productId) {
        return repository.findAllByProductIdOrderByOrderNumberAsc(productId);
    }
}
