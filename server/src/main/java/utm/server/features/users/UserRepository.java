package utm.server.features.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    ArrayList<UserEntity> findByName(String name);

    Optional<UserEntity> findByEmail(String email);
}
