package utm.server.features.shops;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import utm.server.features.products.Product;
import utm.server.features.products.ProductRepository;
import utm.server.features.products.dto.ProductCreationDto;
import utm.server.features.shops.dto.ShopCreationRequestDTO;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;
import utm.server.features.users.security.UserSecurityPrincipal;
import utm.server.features.users.security.UserSecurityPrincipalMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShopService {
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final UserSecurityPrincipalMapper userMapper;
    private final ProductRepository productRepository;

    @Transactional
    public ShopEntity addShop(ShopCreationRequestDTO shopRequest, UserSecurityPrincipal user) {

        if (shopRepository.existsByUser_Id(user.getId()))
            throw new RuntimeException("A shop is already linked to a user");

        ShopEntity shopEntity = new ShopEntity();

        shopEntity.setName(shopRequest.getName());
        shopEntity.setDescription(shopRequest.getDescription());
        shopEntity.setUser(UserEntity.builder().id(user.getId()).build());

        ShopEntity savedShop = shopRepository.save(shopEntity);
        if(shopRequest.getProducts() != null){
            for (ProductCreationDto item : shopRequest.getProducts()) {
                Product product = new Product();
                product.setTitle(item.title());
                product.setPrice(item.price());
                product.setDescription(item.description());
                product.setShopEntity(shopEntity);
                productRepository.save(product);
            }
        }
        return savedShop;
    }
    public ArrayList<ShopEntity> getAllShops() {
        return shopRepository.findAll();
    }

    public ArrayList<ShopEntity> getShopsByName(String name) {
        return shopRepository.findByName(name);
    }

    public ShopEntity getShopById(Long shopId){
        Optional<ShopEntity> shopEntityOptional = shopRepository.findById(shopId);
        if (shopEntityOptional.isPresent()) {
            return shopEntityOptional.get();
        } else {
            throw new RuntimeException("Shop not found with id: " + shopId);
        }
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
