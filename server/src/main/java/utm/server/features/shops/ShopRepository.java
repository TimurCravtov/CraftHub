package utm.server.features.shops;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utm.server.features.products.Product;


import java.util.ArrayList;

@Repository
public interface ShopRepository extends JpaRepository<ShopEntity, Long> {
    ArrayList<ShopEntity> findByName(String name);
    ArrayList<ShopEntity> findAll();
    boolean existsByUserId(Long userId);

}
