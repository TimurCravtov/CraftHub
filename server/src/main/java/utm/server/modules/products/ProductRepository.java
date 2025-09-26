package utm.server.modules.products;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utm.server.modules.shops.ShopEntity;
//import utm.server.features.users.UserRepository;


import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByTitle(String title);

    List<Product> findProductsByShopEntity(ShopEntity shopId);
}
