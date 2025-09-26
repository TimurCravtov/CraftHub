package utm.server.modules.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utm.server.modules.authentication.dto.AuthProvider;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByName(String name);
    List<UserEntity> findByProviderAndName(AuthProvider provider, String name);
    Optional<UserEntity> findByProviderAndProviderId(AuthProvider provider, String providerId);
    Boolean existsByEmail(String email);
}
