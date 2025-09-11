package utm.server.features.products;

//import com.fasterxml.jackson.annotation.JsonTypeId;
import jakarta.persistence.*;
import lombok.Data;
import utm.server.features.users.UserEntity;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private double price;
    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private UserEntity seller;
}

