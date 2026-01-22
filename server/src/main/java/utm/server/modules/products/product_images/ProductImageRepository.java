package utm.server.modules.products.product_images;

import org.springframework.data.jpa.repository.JpaRepository;
import utm.server.modules.products.Product;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImageEntity, Long> {
    List<ProductImageEntity> findAllByProductIdOrderByOrderNumberAsc(Long id);
    void deleteAllByProduct(Product product);
}
