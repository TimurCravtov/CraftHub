package utm.server.modules.products.permission;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import utm.server.modules.products.Product;
import utm.server.modules.products.ProductRepository;
import utm.server.modules.users.UserEntity;
import utm.server.modules.users.UserRepository;

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
