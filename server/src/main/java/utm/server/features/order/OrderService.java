package utm.server.features.order;

import org.springframework.stereotype.Service;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;

import java.util.List;

@Service
public class OrderService {
    OrderRepository orderRepository;
    UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository){
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public List<OrderEntity> findOrdersByUserId(Long userId){return orderRepository.findAllByUser_Id(userId);}

    public OrderEntity createOrder(OrderDTO orderDTO){
        OrderEntity orderEntity = new OrderEntity();
        orderEntity.setStatus(orderDTO.getStatus());
        System.out.println("Received total: " + orderDTO.getTotal());
        orderEntity.setTotal(orderDTO.getTotal());
        UserEntity user = userRepository.findById(orderDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        orderEntity.setUser(user);
        return orderRepository.save(orderEntity);

    }

}
