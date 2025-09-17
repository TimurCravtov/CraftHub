package utm.server.features.shops;

import lombok.Data;
import utm.server.features.products.dto.ProductCreationDto;

import java.util.List;

@Data
public class ShopRequestDTO {
    private String name;
    private String description;
    private Long user_id;
    private List<ProductCreationDto> products;
}
