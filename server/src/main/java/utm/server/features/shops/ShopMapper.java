package utm.server.features.shops;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import utm.server.features.image.ImageService;
import utm.server.features.products.mapper.ProductMapper;
import utm.server.features.shops.dto.ShopDto;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ShopMapper {

    private final ImageService imageService;
    private final ProductMapper productMapper;

    public ShopDto toDto(ShopEntity entity) {
        if (entity == null) return null;

        return ShopDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .shopBannerImageKey(imageService.getPermanentLink(entity.getShopBannerImageKey()))
                .shopImageKey(imageService.getPermanentLink(entity.getShopImageKey()))
                .description(entity.getDescription())
                .products(entity.getProducts() != null
                        ? entity.getProducts().stream()
                        .map(productMapper::toDto)
                        .collect(Collectors.toList())
                        : null)
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .build();
    }

}
