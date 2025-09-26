package utm.server.modules.products.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private String title;
    private Long id;
    private String description;
    private double price;
    private List<String> imageLinks;
    private ShopDto shop;

    @Data
    @Builder
    public static class ShopDto {
        String name;
        Long id;
    }
}
