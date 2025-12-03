package utm.server.modules.shops;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import utm.server.modules.products.Product;
import utm.server.modules.products.ProductRepository;
import utm.server.modules.products.dto.ProductCreationDto;
import utm.server.modules.shops.dto.ShopCreationRequestDTO;
import utm.server.modules.users.UserEntity;
import utm.server.modules.users.UserRepository;
import utm.server.modules.users.security.UserSecurityPrincipal;
import utm.server.modules.users.security.UserSecurityPrincipalMapper;

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

        // if (shopRepository.existsByUser_Id(user.getId()))
        //    throw new RuntimeException("A shop is already linked to a user");

        ShopEntity shopEntity = new ShopEntity();

        shopEntity.setName(shopRequest.getName());
        shopEntity.setDescription(shopRequest.getDescription());
        shopEntity.setShopImageKey(shopRequest.getShopImageKey());
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

    public List<ShopEntity> getShopsByUserId(Long userId) {
        return shopRepository.findByUser_Id(userId);
    }

    public ShopEntity getShopById(Long shopId){
        Optional<ShopEntity> shopEntityOptional = shopRepository.findById(shopId);
        if (shopEntityOptional.isPresent()) {
            return shopEntityOptional.get();
        } else {
            throw new RuntimeException("Shop not found with id: " + shopId);
        }
    }

    public ShopEntity updateShop(Long shopId, ShopCreationRequestDTO shopRequest) {
        ShopEntity shop = getShopById(shopId);
        if (shopRequest.getName() != null) shop.setName(shopRequest.getName());
        if (shopRequest.getDescription() != null) shop.setDescription(shopRequest.getDescription());
        if (shopRequest.getShopImageKey() != null) shop.setShopImageKey(shopRequest.getShopImageKey());
        return shopRepository.save(shop);
    }

    public ShopEntity getShopByUuid(java.util.UUID uuid){
        Optional<ShopEntity> shopEntityOptional = shopRepository.findByUuid(uuid);
        if (shopEntityOptional.isPresent()) {
            return shopEntityOptional.get();
        } else {
            throw new RuntimeException("Shop not found with uuid: " + uuid);
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
