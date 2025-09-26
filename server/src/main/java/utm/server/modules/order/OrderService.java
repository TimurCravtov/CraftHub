package utm.server.modules.order;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utm.server.modules.cart.Cart;
import utm.server.modules.cart.CartItem;
import utm.server.modules.cart.CartService;
import utm.server.modules.order.dto.OrderCreateRequest;
import utm.server.modules.order.dto.OrderItemDTO;
import utm.server.modules.order.dto.OrderResponseDTO;
import utm.server.modules.products.Product;
import utm.server.modules.products.ProductRepository;
import utm.server.modules.users.UserEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(UserEntity user) {
        List<OrderEntity> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long orderId, UserEntity user) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Security check - ensure the order belongs to the user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Not authorized to view this order");
        }

        return convertToDTO(order);
    }

    @Transactional
    public OrderResponseDTO createOrderFromCart(OrderCreateRequest request, UserEntity user) {
        // Get user's cart
        Cart cart = cartService.getCart(user);

        // Validate cart
        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot create order from empty cart");
        }

        // Create new order entity
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Status.PENDING);

        // Set shipping details
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingCity(request.getShippingCity());
        order.setShippingState(request.getShippingState());
        order.setShippingZip(request.getShippingZip());
        order.setShippingCountry(request.getShippingCountry());

        // Save order first to get an ID
        order = orderRepository.save(order);

        // Convert cart items to order items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());

            // Fix: Convert double to BigDecimal
            orderItem.setPrice(BigDecimal.valueOf(product.getPrice())); // Convert double to BigDecimal
            orderItem.setProductName(product.getTitle()); // Save current name

            // Add to order
            order.addItem(orderItem);
        }

        // Calculate total
        order.setTotalAmount(order.calculateTotal());

        // Save order with items
        order = orderRepository.save(order);

        // Clear the cart after successful order creation
        cartService.clearCart(user);

        // Return order DTO
        return convertToDTO(order);
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, Status status, UserEntity admin) {
        // This would typically include admin/auth checks
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        order.setStatus(status);
        order = orderRepository.save(order);

        return convertToDTO(order);
    }

    // Helper method to convert entity to DTO
    private OrderResponseDTO convertToDTO(OrderEntity order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());

        // Set shipping info
        dto.setShippingAddress(order.getShippingAddress());
        dto.setShippingCity(order.getShippingCity());
        dto.setShippingState(order.getShippingState());
        dto.setShippingZip(order.getShippingZip());
        dto.setShippingCountry(order.getShippingCountry());

        // Convert order items
        List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setProductId(item.getProduct().getId());
            itemDTO.setProductName(item.getProductName());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            itemDTO.setTotal(item.getTotal());
            return itemDTO;
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);

        return dto;
    }
}
