package utm.server.features.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    ArrayList<UserEntity> findByName(String name);

    ArrayList<UserEntity> findByAccountTypeAndName(String accountType, String name);

    Boolean existsByEmail(String email);
}
