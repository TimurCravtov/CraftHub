package utm.server.features.products;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import utm.server.except.NoRightsException;
import utm.server.features.image.ImageService;
import utm.server.features.image.dto.ImageUploadResponse;
import utm.server.features.products.dto.ProductCreationDto;
import utm.server.features.products.dto.ProductDto;
import utm.server.features.products.mapper.ProductMapper;
import utm.server.features.products.permission.ProductEditPermissionService;
import utm.server.features.products.product_images.ProductImageService;
import utm.server.features.shops.ShopEntity;
import utm.server.features.users.UserEntity;
import utm.server.features.users.security.UserSecurityPrincipal;
import utm.server.features.users.security.UserSecurityPrincipalMapper;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ImageService imageService;
    private final ProductMapper productMapper;
    private final ProductEditPermissionService productEditPermissionService;
    private final ProductImageService productImageService;

    private final EntityManager entityManager; // Add this
    private final UserSecurityPrincipalMapper userSecurityPrincipalMapper;

    public List<Product> findAllProducts() {
        return productRepository.findAll();
    }


    public Optional<ProductDto> findById(Long id) {
        return  productRepository.findById(id).map(productMapper::toDto);
    }

    public List<ProductDto> findAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toDto)
                .toList();
    }

    public List<ProductDto> findProductsByTitle(String title) {
        return productRepository.findByTitle(title)
                .stream()
                .map(productMapper::toDto)
                .toList();
    }

    public List<ProductDto> findProductsByShopId(Long shopId) {
        ShopEntity shop = new ShopEntity();
        shop.setId(shopId);
        return productRepository.findProductsByShopEntity(shop)
                .stream()
                .map(productMapper::toDto)
                .toList();
    }

    @Transactional
    public ProductDto addProduct(ProductCreationDto product, UserSecurityPrincipal authUser) throws NoRightsException {

        UserEntity user = userSecurityPrincipalMapper.getUser(authUser);

        if (!productEditPermissionService.hasRightsToEditProducts(product.shopId(), authUser))
            throw new NoRightsException("Wrong");

        List<ImageUploadResponse> permanentImages = product.productImagesTemp().stream()
                .map(img -> imageService.confirmUpload(img.key())).toList();

        Product productToSave = new Product();
        productToSave.setDescription(product.description());
        productToSave.setTitle(product.title());
        productToSave.setPrice(product.price());

        ShopEntity shop = entityManager.getReference(ShopEntity.class, product.shopId());
        productToSave.setShopEntity(shop);

        Product saved = productRepository.save(productToSave);
        productImageService.saveAll(permanentImages, saved);
        return saved;
     
    }
}
