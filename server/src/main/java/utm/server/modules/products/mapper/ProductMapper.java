package utm.server.modules.products.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import utm.server.modules.image.ImageService;
import utm.server.modules.products.Product;
import utm.server.modules.products.dto.ProductDto;
import utm.server.modules.products.product_images.ProductImageEntity;
import utm.server.modules.products.product_images.ProductImageService;
import utm.server.modules.shops.ShopEntity;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    private final ImageService imageService;
    private final ProductImageService productImageService;

    public ProductDto toDto(final Product product) {

        ShopEntity shop = product.getShopEntity();
        List<ProductImageEntity> imageEntities = productImageService.findAllByProductId(product.getId());

        return  ProductDto
                .builder()
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .id(product.getId())
                .imageLinks(imageEntities
                        .stream()
                        .map(i->imageService.getPermanentLink(i.getKey()))
                        .toList())
                .shop(ProductDto.ShopDto.builder()
                        .id(shop.getId())
                        .name(shop.getName())
                        .build())
                .build();
    }
}
