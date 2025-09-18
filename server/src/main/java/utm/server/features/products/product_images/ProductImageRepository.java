package utm.server.features.products.product_images;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImageEntity, Long> {
    List<ProductImageEntity> findAllByProductIdOrderByOrderNumberAsc(Long id);
}
