package utm.server.modules.shops.dto;

import lombok.Data;
import utm.server.modules.products.dto.ProductCreationDto;

import java.util.List;

@Data
public class ShopCreationRequestDTO {
    private String name;
    private String description;
    private List<ProductCreationDto> products;
}
