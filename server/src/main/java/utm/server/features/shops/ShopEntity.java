package utm.server.features.shops;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.features.products.Product;
import utm.server.features.users.UserEntity;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table
public class ShopEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = true)
    private String description;
    @OneToMany(mappedBy="shopEntity")
    @JsonManagedReference
    private List<Product> products;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private UserEntity user;
    @JsonProperty("user_id")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }



}
