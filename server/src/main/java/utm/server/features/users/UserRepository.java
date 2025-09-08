package utm.server.features.users;

import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;


@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
<<<<<<< HEAD
<<<<<<< HEAD
ArrayList<UserEntity> findByName(String name);
ArrayList<UserEntity> findByAccountTypeandName(String accountType, String name);

=======
    ArrayList<UserEntity> findByName(String name);
>>>>>>> de166c4f29a731e87db86f6054fa8fe559f4b808
=======
    ArrayList<UserEntity> findByName(String name);
>>>>>>> a0febdee0bcdde0e028d644780b30ec974d06eb7
}
