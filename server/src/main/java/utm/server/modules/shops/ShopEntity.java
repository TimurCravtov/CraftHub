package utm.server.modules.shops;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.modules.products.Product;
import utm.server.modules.users.UserEntity;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table
public class ShopEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    @Builder.Default
    private java.util.UUID uuid = java.util.UUID.randomUUID();

    @Column(nullable = false)
    private String name;

    private String shopBannerImageKey;
    private String shopImageKey;

    @Column(nullable = true)
    private String description;
    @OneToMany(mappedBy="shopEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Product> products = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private UserEntity user;
    @JsonProperty("user_id")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

}
