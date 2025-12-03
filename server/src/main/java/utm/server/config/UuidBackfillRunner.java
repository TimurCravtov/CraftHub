package utm.server.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import utm.server.modules.products.Product;
import utm.server.modules.products.ProductRepository;
import utm.server.modules.shops.ShopEntity;
import utm.server.modules.shops.ShopRepository;
import utm.server.modules.users.UserEntity;
import utm.server.modules.users.UserRepository;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UuidBackfillRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        backfillUsers();
        backfillShops();
        backfillProducts();
    }

    private void backfillUsers() {
        List<UserEntity> users = userRepository.findByUuidIsNull();
        if (!users.isEmpty()) {
            log.info("Found {} users without UUID. Generating...", users.size());
            for (UserEntity user : users) {
                user.setUuid(UUID.randomUUID());
            }
            userRepository.saveAll(users);
            log.info("Users UUID backfill completed.");
        }
    }

    private void backfillShops() {
        List<ShopEntity> shops = shopRepository.findByUuidIsNull();
        if (!shops.isEmpty()) {
            log.info("Found {} shops without UUID. Generating...", shops.size());
            for (ShopEntity shop : shops) {
                shop.setUuid(UUID.randomUUID());
            }
            shopRepository.saveAll(shops);
            log.info("Shops UUID backfill completed.");
        }
    }

    private void backfillProducts() {
        List<Product> products = productRepository.findByUuidIsNull();
        if (!products.isEmpty()) {
            log.info("Found {} products without UUID. Generating...", products.size());
            for (Product product : products) {
                product.setUuid(UUID.randomUUID());
            }
            productRepository.saveAll(products);
            log.info("Products UUID backfill completed.");
        }
    }
}
