package utm.server.modules.products;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
//import com.fasterxml.jackson.annotation.JsonTypeId;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.modules.categories.CategoryEntity;
import utm.server.modules.shops.ShopEntity;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    @Builder.Default
    private java.util.UUID uuid = java.util.UUID.randomUUID();

    private String title;
    private String description;
    private double price;
    @ManyToOne
    @JoinColumn(name = "shop_id", referencedColumnName = "id")
    @JsonBackReference
    private ShopEntity shopEntity;
    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonBackReference
    private CategoryEntity categoryEntity;

    @JsonProperty("shop_id")
    public Long getShopId() {
        return shopEntity != null ? shopEntity.getId() : null;
    }
}
