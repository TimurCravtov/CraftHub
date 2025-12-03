package utm.server.modules.shops.dto;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import utm.server.modules.image.ImageService;
import utm.server.modules.shops.ShopEntity;

@Service
@RequiredArgsConstructor
public class ShopMapper {
    private final ImageService imageService;

    public ShopDto toDto(ShopEntity shopEntity) {
        ShopDto shopDto = new ShopDto();
        shopDto.setId(shopEntity.getId());
        shopDto.setUuid(shopEntity.getUuid());
        shopDto.setName(shopEntity.getName());
        shopDto.setDescription(shopEntity.getDescription());


        String banner = shopEntity.getShopBannerImageKey() != null
                ? imageService.getPermanentLink(shopEntity.getShopBannerImageKey())
                : null;

        String icon = shopEntity.getShopImageKey() != null
                ? imageService.getPermanentLink(shopEntity.getShopImageKey())
                : null;

        shopDto.setShopImageUrl(icon);
        shopDto.setShopBannerImageUrl(banner);
        return shopDto;

    }
}
