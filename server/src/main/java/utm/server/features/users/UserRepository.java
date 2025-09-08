package utm.server.features.users;

import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;


@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
ArrayList<UserEntity> findByName(String name);
ArrayList<UserEntity> findByAccountTypeandName(String accountType, String name);

}
