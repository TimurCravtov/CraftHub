package utm.server.modules.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utm.server.modules.users.UserEntity;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserOrderByOrderDateDesc(UserEntity user);

    List<OrderEntity> findByStatus(Status status);

    @Query("SELECT DISTINCT o FROM OrderEntity o JOIN o.items i JOIN i.product p WHERE p.shopEntity.id = :shopId ORDER BY o.orderDate DESC")
    List<OrderEntity> findOrdersByShopId(@Param("shopId") Long shopId);

    @Query("SELECT COUNT(DISTINCT o) FROM OrderEntity o JOIN o.items i JOIN i.product p WHERE p.shopEntity.user.id = :userId AND o.status = 'PENDING'")
    Long countPendingOrdersForSeller(@Param("userId") Long userId);

    @Query("SELECT DISTINCT o FROM OrderEntity o JOIN o.items i JOIN i.product p WHERE p.shopEntity.user.id = :userId ORDER BY o.orderDate DESC")
    List<OrderEntity> findOrdersBySellerId(@Param("userId") Long userId);
}
