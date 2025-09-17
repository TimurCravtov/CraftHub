package utm.server.features.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utm.server.features.users.UserEntity;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // Change this method to follow Spring Data JPA naming conventions
    Optional<Cart> findByUserId(Long userId);

    // If you still need to query by user entity
    Optional<Cart> findByUser(UserEntity user);
}