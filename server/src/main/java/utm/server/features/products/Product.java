package utm.server.features.products;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeId;
//import com.fasterxml.jackson.annotation.JsonTypeId;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.features.categories.CategoryEntity;
import utm.server.features.shops.ShopEntity;
import utm.server.features.users.UserEntity;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
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
