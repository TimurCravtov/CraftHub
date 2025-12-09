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
import utm.server.modules.shops.ShopEntity;
import utm.server.modules.shops.ShopRepository;
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
    private final ShopRepository shopRepository;

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
        order.setPhoneNumber(request.getPhoneNumber());
        order.setNote(request.getNote());

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

        // Clear cart
        cartService.clearCart(user);

        return convertToDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getShopOrders(Long shopId, UserEntity user) {
        ShopEntity shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found"));

        if (!shop.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Not authorized to view orders for this shop");
        }

        List<OrderEntity> orders = orderRepository.findOrdersByShopId(shopId);
        return orders.stream()
                .map(order -> convertToDTOForShop(order, shopId))
                .collect(Collectors.toList());
    }

    private OrderResponseDTO convertToDTOForShop(OrderEntity order, Long shopId) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        
        // Set shipping info
        dto.setShippingAddress(order.getShippingAddress());
        dto.setShippingCity(order.getShippingCity());
        dto.setShippingState(order.getShippingState());
        dto.setShippingZip(order.getShippingZip());
        dto.setShippingCountry(order.getShippingCountry());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setNote(order.getNote());
        
        if (order.getUser() != null) {
            dto.setBuyerName(order.getUser().getName());
            dto.setBuyerEmail(order.getUser().getEmail());
        }

        // Filter items for this shop
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .filter(item -> item.getProduct().getShopEntity().getId().equals(shopId))
                .map(item -> {
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
        
        // Recalculate total for this shop's portion
        BigDecimal shopTotal = itemDTOs.stream()
                .map(OrderItemDTO::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(shopTotal);

        return dto;
    }

    @Transactional(readOnly = true)
    public Long getPendingOrdersCount(UserEntity seller) {
        return orderRepository.countPendingOrdersForSeller(seller.getId());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getSellerOrders(UserEntity seller) {
        List<OrderEntity> orders = orderRepository.findOrdersBySellerId(seller.getId());
        return orders.stream()
                .map(order -> convertToDTOForSeller(order, seller.getId()))
                .collect(Collectors.toList());
    }

    private OrderResponseDTO convertToDTOForSeller(OrderEntity order, Long sellerId) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        
        dto.setShippingAddress(order.getShippingAddress());
        dto.setShippingCity(order.getShippingCity());
        dto.setShippingState(order.getShippingState());
        dto.setShippingZip(order.getShippingZip());
        dto.setShippingCountry(order.getShippingCountry());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setNote(order.getNote());

        if (order.getUser() != null) {
            dto.setBuyerName(order.getUser().getName());
            dto.setBuyerEmail(order.getUser().getEmail());
        }

        // Filter items for any shop owned by this seller
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .filter(item -> item.getProduct().getShopEntity().getUser().getId().equals(sellerId))
                .map(item -> {
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
        
        // Recalculate total for this seller's portion
        BigDecimal sellerTotal = itemDTOs.stream()
                .map(OrderItemDTO::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(sellerTotal);

        return dto;
    }

    @Transactional
    public void deleteOrder(Long orderId, UserEntity user) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Check if user is the buyer
        boolean isBuyer = order.getUser().getId().equals(user.getId());

        // Check if user is a seller for any item in the order
        boolean isSeller = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getShopEntity().getUser().getId().equals(user.getId()));

        if (!isBuyer && !isSeller) {
            throw new SecurityException("Not authorized to delete this order");
        }

        orderRepository.delete(order);
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
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setNote(order.getNote());

        if (order.getUser() != null) {
            dto.setBuyerName(order.getUser().getName());
            dto.setBuyerEmail(order.getUser().getEmail());
        }

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
