package utm.server.features.cart;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utm.server.features.cart.dto.CartItemRequest;
import utm.server.features.products.Product;
import utm.server.features.products.ProductRepository;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Cart getCart(UserEntity user) {
        // Fix method name to match repository method
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public void addItemToCart(UserEntity user, CartItemRequest request) {
        Cart cart = getCart(user);

        // Make sure we get a managed entity
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());

            // Save the item first, then add to collection
            CartItem savedItem = cartItemRepository.save(newItem);
            cart.getItems().add(savedItem);
        }
        cartRepository.save(cart);
    }

    @Transactional
    public void updateItemQuantity(UserEntity user, CartItemRequest request) {
        Cart cart = getCart(user);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item not in cart"));

        if (request.getQuantity() <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }
        cartRepository.save(cart);
    }

    @Transactional
    public void removeItemFromCart(UserEntity user, Long productId) {
        Cart cart = getCart(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item not in cart"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cartRepository.save(cart);
    }

    // NEW METHOD: Update item quantity by cart item ID
    @Transactional
    public void updateItemQuantityByCartItemId(UserEntity user, CartItemRequest request) {
        Cart cart = getCart(user);

        // Find the cart item by ID
        CartItem item = cartItemRepository.findById(request.getCartItemId())
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        // Verify the cart item belongs to the user's cart
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new SecurityException("Cannot update cart item that doesn't belong to the user's cart");
        }

        if (request.getQuantity() <= 0) {
            // Remove the item if quantity is 0 or negative
            removeItemFromCartByCartItemId(user, request.getCartItemId());
        } else {
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }
    }

    // NEW METHOD: Remove item from cart by cart item ID
    @Transactional
    public void removeItemFromCartByCartItemId(UserEntity user, Long cartItemId) {
        Cart cart = getCart(user);

        // Find the cart item by ID
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        // Verify the cart item belongs to the user's cart
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new SecurityException("Cannot remove cart item that doesn't belong to the user's cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(UserEntity user) {
        Cart cart = getCart(user);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}