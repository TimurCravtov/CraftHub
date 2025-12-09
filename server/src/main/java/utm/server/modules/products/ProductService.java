package utm.server.modules.products;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import utm.server.except.NoRightsException;
import utm.server.modules.image.ImageService;
import utm.server.modules.image.dto.ImageUploadResponse;
import utm.server.modules.products.dto.ProductCreationDto;
import utm.server.modules.products.dto.ProductDto;
import utm.server.modules.products.mapper.ProductMapper;
import utm.server.modules.products.permission.ProductEditPermissionService;
import utm.server.modules.products.product_images.ProductImageService;
import utm.server.modules.shops.ShopEntity;
import utm.server.modules.users.UserEntity;
import utm.server.modules.users.security.UserSecurityPrincipal;
import utm.server.modules.users.security.UserSecurityPrincipalMapper;

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
    private final TagRepository tagRepository;

    private final EntityManager entityManager; // Add this
    private final UserSecurityPrincipalMapper userSecurityPrincipalMapper;



    public Optional<ProductDto> findById(Long id) {
        return  productRepository.findById(id).map(productMapper::toDto);
    }

    public Optional<ProductDto> findByUuid(java.util.UUID uuid) {
        return productRepository.findByUuid(uuid).map(productMapper::toDto);
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

    public List<ProductDto> findProductsByShopUuid(java.util.UUID shopUuid) {
        // We need to find the shop first to get the entity, or use a custom query in repo
        // Assuming we can't just create a dummy entity with UUID for lookup in standard JPA without ID
        // But wait, findProductsByShopEntity expects an entity.
        // Let's assume we need to fetch the shop first.
        // Or better, add findByShopEntity_Uuid to ProductRepository
        return productRepository.findProductsByShopEntity_Uuid(shopUuid)
                .stream()
                .map(productMapper::toDto)
                .toList();
    }

    @Transactional
    public ProductDto addProduct(ProductCreationDto product, UserSecurityPrincipal authUser) throws NoRightsException {

        UserEntity user = userSecurityPrincipalMapper.getUser(authUser);

        if (!productEditPermissionService.hasRightsToEditProducts(product.shopId(), user))
            throw new NoRightsException("Wrong");

        List<ImageUploadResponse> permanentImages = product.productImagesTemp().stream()
                .map(img -> imageService.confirmUpload(img.key())).toList();

        Product productToSave = new Product();
        productToSave.setDescription(product.description());
        productToSave.setTitle(product.title());
        productToSave.setPrice(product.price());
        if (product.tags() != null) {
            List<TagEntity> tagEntities = product.tags().stream()
                .map(name -> tagRepository.findByName(name).orElse(null))
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
            productToSave.setTags(tagEntities);
        }

        ShopEntity shop = entityManager.getReference(ShopEntity.class, product.shopId());
        productToSave.setShopEntity(shop);

        Product saved = productRepository.save(productToSave);
        productImageService.saveAll(permanentImages, saved);
        return productMapper.toDto(saved);
     
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductCreationDto productDto, UserSecurityPrincipal authUser) throws NoRightsException {
        UserEntity user = userSecurityPrincipalMapper.getUser(authUser);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!productEditPermissionService.hasRightsToEditProducts(product.getShopEntity().getId(), user))
             throw new NoRightsException("You do not have permission to edit this product");

        product.setTitle(productDto.title());
        product.setDescription(productDto.description());
        product.setPrice(productDto.price());
        if (productDto.tags() != null) {
            List<TagEntity> tagEntities = productDto.tags().stream()
                .map(name -> tagRepository.findByName(name).orElse(null))
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
            product.setTags(tagEntities);
        }

        // Handle images if needed - for now assuming we just update text fields or append images
        // If we want to replace images, we need more logic in ProductImageService
        if (productDto.productImagesTemp() != null && !productDto.productImagesTemp().isEmpty()) {
             List<ImageUploadResponse> permanentImages = productDto.productImagesTemp().stream()
                .map(img -> imageService.confirmUpload(img.key())).toList();
             productImageService.saveAll(permanentImages, product);
        }

        return productMapper.toDto(productRepository.save(product));
    }
}
