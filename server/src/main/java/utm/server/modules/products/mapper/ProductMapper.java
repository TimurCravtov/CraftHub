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

        ProductDto.ProductDtoBuilder builder = ProductDto.builder()
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .id(product.getId())
                .uuid(product.getUuid())
                .imageLinks(imageEntities
                        .stream()
                        .map(i->imageService.getPermanentLink(i.getKey()))
                        .toList());

        if (shop != null) {
            builder.shopId(shop.getId());
            builder.shopUuid(shop.getUuid());
            builder.shop(ProductDto.ShopDto.builder()
                    .id(shop.getId())
                    .uuid(shop.getUuid())
                    .name(shop.getName())
                    .build());
        }

        return builder.build();
    }
}
