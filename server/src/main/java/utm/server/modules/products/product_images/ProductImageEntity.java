package utm.server.modules.products.product_images;

import jakarta.persistence.*;
import lombok.*;
import utm.server.modules.products.Product;

@Entity
@Table(name = "product_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String key;

    @Column(name = "order_number", nullable = false)
    private int orderNumber;
}
