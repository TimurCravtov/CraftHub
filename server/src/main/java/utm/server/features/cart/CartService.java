package utm.server.features.cart;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utm.server.features.cart.dto.CartItemRequest;
import utm.server.features.products.Product;
import utm.server.features.products.ProductRepository;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;

import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
            ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Cart getOrCreateCart(UserEntity user) {
        Cart cart = cartRepository.findByUserId(user.getId());
        if (cart == null) {
            cart = new Cart(user);
            cartRepository.save(cart);
        }
        return cart;
    }

    @Transactional
    public Cart addItemToCart(UserEntity user, CartItemRequest request) {
        Cart cart = getOrCreateCart(user);
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        if (productOpt.isEmpty())
            throw new RuntimeException("Product not found");

        Product product = productOpt.get();
        CartItem existingItem = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(product.getId()))
                .findFirst().orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cart.addItem(newItem);
        }
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItemQuantity(UserEntity user, CartItemRequest request) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(request.getProductId()))
                .findFirst().orElseThrow(() -> new RuntimeException("Item not found in cart"));
        item.setQuantity(request.getQuantity());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItemFromCart(UserEntity user, Long productId) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst().orElseThrow(() -> new RuntimeException("Item not found in cart"));
        cart.removeItem(item);
        cartItemRepository.delete(item);
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(UserEntity user) {
        Cart cart = getOrCreateCart(user);
        cart.clearItems();
        cartRepository.save(cart);
    }

    public Cart getCart(UserEntity user) {
        return getOrCreateCart(user);
    }
}