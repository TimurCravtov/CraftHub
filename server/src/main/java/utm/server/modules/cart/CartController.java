package utm.server.modules.cart;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import utm.server.modules.cart.dto.CartItemRequest;
import utm.server.modules.cart.dto.CartItemResponse;
import utm.server.modules.cart.dto.CartResponse;
import utm.server.modules.users.UserEntity;
import utm.server.modules.users.security.UserSecurityPrincipal;
import utm.server.modules.users.security.UserSecurityPrincipalMapper;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final UserSecurityPrincipalMapper userSecurityPrincipalMapper;

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
            cir.setCartItemId(item.getId()); // Include cart item ID in the response
            return cir;
        }).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);
        return buildCartResponse(user);
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addItem(@RequestBody CartItemRequest request,
            @AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);

        cartService.addItemToCart(user, request);
        return buildCartResponse(user);
    }

    @PostMapping("/update")
    public ResponseEntity<CartResponse> updateItem(@RequestBody CartItemRequest request,
            @AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);

        // Use the new method that uses cart item ID
        cartService.updateItemQuantityByCartItemId(user, request);
        return buildCartResponse(user);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long cartItemId,
            @AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);

        // Use the new method that uses cart item ID
        cartService.removeItemFromCartByCartItemId(user, cartItemId);
        return buildCartResponse(user);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);

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