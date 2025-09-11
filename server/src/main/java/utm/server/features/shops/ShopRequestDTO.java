package utm.server.features.shops;

import lombok.Data;

@Data
public class ShopRequestDTO {
    private String name;
    private String description;
    private Long user_id;
}
