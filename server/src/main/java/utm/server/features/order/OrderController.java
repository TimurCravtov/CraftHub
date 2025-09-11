package utm.server.features.order;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/")
    public OrderEntity createOrder(@RequestBody OrderDTO orderDTO){
        return orderService.createOrder(orderDTO);
    }

    @GetMapping("/{userId}")
    public List<OrderEntity> findOrdersByUserId(@PathVariable Long userId){
        return orderService.findOrdersByUserId(userId);
    }

}
