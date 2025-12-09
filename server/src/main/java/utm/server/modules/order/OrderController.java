package utm.server.modules.order;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import utm.server.modules.order.dto.OrderCreateRequest;
import utm.server.modules.order.dto.OrderResponseDTO;
import utm.server.modules.users.UserEntity;
import utm.server.modules.users.security.UserSecurityPrincipal;
import utm.server.modules.users.security.UserSecurityPrincipalMapper;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserSecurityPrincipalMapper userSecurityPrincipalMapper;

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(@AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(orderService.getUserOrders(user));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long orderId,
            @AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            OrderResponseDTO order = orderService.getOrderById(orderId, user);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<OrderResponseDTO>> getShopOrders(@PathVariable Long shopId,
            @AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);

        try {
            List<OrderResponseDTO> orders = orderService.getShopOrders(shopId, user);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/seller/pending-count")
    public ResponseEntity<Long> getPendingOrdersCount(@AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);
        return ResponseEntity.ok(orderService.getPendingOrdersCount(user));
    }

    @GetMapping("/seller/orders")
    public ResponseEntity<List<OrderResponseDTO>> getSellerOrders(@AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);
        return ResponseEntity.ok(orderService.getSellerOrders(user));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId,
            @AuthenticationPrincipal UserSecurityPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserEntity user = userSecurityPrincipalMapper.getUser(principal);

        try {
            orderService.deleteOrder(orderId, user);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<OrderResponseDTO> createOrderFromCart(@RequestBody OrderCreateRequest request,
            @AuthenticationPrincipal UserSecurityPrincipal user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {

            UserEntity realUser = userSecurityPrincipalMapper.getUser(user);
            OrderResponseDTO order = orderService.createOrderFromCart(request, realUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(@PathVariable Long orderId,
            @RequestParam Status status,
            @AuthenticationPrincipal UserEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            OrderResponseDTO order = orderService.updateOrderStatus(orderId, status, user);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleExceptions(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
    }
}
