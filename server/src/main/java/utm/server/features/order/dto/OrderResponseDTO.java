package utm.server.features.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.features.order.Status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String userEmail;
    private LocalDateTime orderDate;
    private Status status;
    private BigDecimal totalAmount;
    private List<OrderItemDTO> items;

    // Shipping details
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingZip;
    private String shippingCountry;

    // Payment info (limited)
    private String paymentMethod;
}