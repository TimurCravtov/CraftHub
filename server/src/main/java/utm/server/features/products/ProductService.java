package utm.server.features.products;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import utm.server.except.NoRightsException;
import utm.server.features.image.ImageService;
import utm.server.features.image.dto.ImageUploadResponse;
import utm.server.features.products.dto.ProductCreationDto;
import utm.server.features.products.permission.ProductEditPermissionService;
import utm.server.features.products.product_images.ProductImageService;
import utm.server.features.shops.ShopEntity;
import utm.server.features.users.UserEntity;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ImageService imageService;
    private final ProductEditPermissionService productEditPermissionService;
    private final ProductImageService productImageService;
    private final EntityManager entityManager; // Add this

    public List<Product> findAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> findProductsByTitle(String title) {
        return productRepository.findByTitle(title);
    }

    public List<Product> findProductsByShopId(Long shopId) {
        ShopEntity s = new ShopEntity();
        s.setId(shopId);
        return productRepository.findProductsByShopEntity(s);
    }

    @Transactional
    public Product addProduct(ProductCreationDto product, UserEntity authUser) throws NoRightsException {

        if (!productEditPermissionService.hasRightsToEditProducts(product.shopId(), authUser))
            throw new NoRightsException("Wrong");

        List<ImageUploadResponse> permanentImages = product.productImagesTemp().stream()
                .map(img -> imageService.confirmUpload(img.key())).toList();

        Product productToSave = new Product();
        productToSave.setDescription(product.description());
        productToSave.setTitle(product.title());
        productToSave.setPrice(product.price());

        // 🔧 FIX: Associate with existing shop
        ShopEntity shop = entityManager.getReference(ShopEntity.class, product.shopId());
        productToSave.setShopEntity(shop);

        Product saved = productRepository.save(productToSave);
        productImageService.saveAll(permanentImages, saved);
        return saved;
    }
}
