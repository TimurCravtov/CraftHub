package utm.server.features.cart;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utm.server.features.cart.dto.CartItemRequest;
import utm.server.features.cart.dto.CartItemResponse;
import utm.server.features.cart.dto.CartResponse;
import utm.server.features.users.UserEntity;

import java.security.Principal;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;
    private final utm.server.features.users.UserRepository userRepository;

    public CartController(CartService cartService, utm.server.features.users.UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    //Helper to get current user (adapt as needed for your security)
    private UserEntity getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<utm.server.features.cart.dto.CartResponse> getCart(Principal principal) {
        UserEntity user = getCurrentUser(principal);
        Cart cart = cartService.getCart(user);
        utm.server.features.cart.dto.CartResponse response = new utm.server.features.cart.dto.CartResponse();
        response.setCartId(cart.getId());
        response.setItems(cart.getItems().stream().map(item -> {
            CartItemResponse cir = new CartItemResponse();
            cir.setProductId(item.getProduct().getId());
            cir.setProductName(item.getProduct().getName());
            cir.setQuantity(item.getQuantity());
            return cir;
        }).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }

        @PostMapping("/add")
    public ResponseEntity<CartResponse> addItem(@RequestBody CartItemRequest request, Principal principal) {
        UserEntity user = getCurrentUser(principal);
        Cart cart = cartService.addItemToCart(user, request);
        return getCart(principal);
    }

    @PostMapping("/update")
    public ResponseEntity<CartResponse> updateItem(@RequestBody CartItemRequest request, Principal principal) {
        UserEntity user = getCurrentUser(principal);
        Cart cart = cartService.updateItemQuantity(user, request);
        return getCart(principal);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long productId, Principal principal) {
        UserEntity user = getCurrentUser(principal);
        Cart cart = cartService.removeItemFromCart(user, productId);
        return getCart(principal);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Principal principal) {
        UserEntity user = getCurrentUser(principal);
        cartService.clearCart(user);
        return ResponseEntity.ok().build();
    }
}