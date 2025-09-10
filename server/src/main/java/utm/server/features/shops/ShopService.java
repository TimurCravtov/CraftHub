package utm.server.features.shops;

import org.springframework.stereotype.Service;
import utm.server.features.products.Product;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ShopService {
    private final ShopRepository shopRepository;

    public ShopService(ShopRepository shopRepository) {
        this.shopRepository = shopRepository;
    }

    public ShopEntity addShop(ShopEntity shopEntity) {
        return shopRepository.save(shopEntity);
    }
    public ArrayList<ShopEntity> getAllShops() {
        return shopRepository.findAll();
    }

    public ArrayList<ShopEntity> getShopsByName(String name) {
        return shopRepository.findByName(name);
    }

    public List<Product> getProductsByShopId(Long shopId) {
        Optional<ShopEntity> shopEntityOptional = shopRepository.findById(shopId);

        if (shopEntityOptional.isPresent()) {
            ShopEntity shopEntity = shopEntityOptional.get();
            return shopEntity.getProducts();
        } else {
            throw new RuntimeException("Shop not found with id: " + shopId);
        }


    }
}
