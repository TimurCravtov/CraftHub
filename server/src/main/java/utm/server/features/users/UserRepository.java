package utm.server.features.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utm.server.features.billing.BillingDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByName(String name);

    List<UserEntity> findByAccountTypeAndName(AccountType accountType, String name);

    Boolean existsByEmail(String email);
}
