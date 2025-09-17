package utm.server.features.products.permission;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import utm.server.features.products.Product;
import utm.server.features.products.ProductRepository;
import utm.server.features.products.ProductService;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;

@Service
@RequiredArgsConstructor
public class ProductEditPermissionService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public boolean hasRightsToEditProduct(Product product, UserEntity currentUser) {
        return true; // for now
    }

    public boolean hasRightsToEditProducts(Long shopId, UserEntity currentUser) {
        return true;
    }


}
