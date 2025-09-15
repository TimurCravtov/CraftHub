package utm.server.features.cart;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import utm.server.features.cart.dto.CartItemRequest;
import utm.server.features.cart.dto.CartItemResponse;
import utm.server.features.cart.dto.CartResponse;
import utm.server.features.users.UserEntity;

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

    // Helper method to create cart response
    private ResponseEntity<CartResponse> buildCartResponse(UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Cart cart = cartService.getCart(user);
        CartResponse response = new CartResponse();
        response.setCartId(cart.getId());
        response.setItems(cart.getItems().stream().map(item -> {
            CartItemResponse cir = new CartItemResponse();
            cir.setProductId(item.getProduct().getId());
            cir.setProductName(item.getProduct().getTitle());
            cir.setQuantity(item.getQuantity());
            return cir;
        }).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }

    /// works
    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserEntity user) {
        return buildCartResponse(user);
    }

    /// works
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addItem(@RequestBody CartItemRequest request,
            @AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        cartService.addItemToCart(user, request);
        return buildCartResponse(user);
    }

    @PostMapping("/update")
    public ResponseEntity<CartResponse> updateItem(@RequestBody CartItemRequest request,
            @AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        cartService.updateItemQuantity(user, request);
        return buildCartResponse(user);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long productId,
            @AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        cartService.removeItemFromCart(user, productId);
        return buildCartResponse(user);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        cartService.clearCart(user);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}