package utm.server.features.shops;

import org.springframework.stereotype.Service;
import utm.server.features.products.Product;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ShopService {
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    public ShopService(ShopRepository shopRepository, UserRepository userRepository) {
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
    }

    public ShopEntity addShop(ShopRequestDTO shopRequest) {
        UserEntity user = userRepository.findById(shopRequest.getUser_id())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + shopRequest.getUser_id()));

        ShopEntity shopEntity = new ShopEntity();
        shopEntity.setName(shopRequest.getName());
        shopEntity.setDescription(shopRequest.getDescription());
        shopEntity.setUser(user);

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
