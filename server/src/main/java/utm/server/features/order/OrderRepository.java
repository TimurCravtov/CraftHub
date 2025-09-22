package utm.server.features.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utm.server.features.users.UserEntity;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserOrderByOrderDateDesc(UserEntity user);

    List<OrderEntity> findByStatus(Status status);
}
