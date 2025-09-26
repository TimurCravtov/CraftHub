package utm.server.modules.shops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.modules.products.dto.ProductDto;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopDto {
    private Long id;
    private String name;
    private String shopBannerImageKey;
    private String shopImageKey;
    private String description;
    private List<ProductDto> products;
    private Long userId;
}
