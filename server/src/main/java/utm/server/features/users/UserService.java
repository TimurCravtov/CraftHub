package utm.server.features.users;

import java.util.ArrayList;


public interface UserService {
<<<<<<< HEAD
<<<<<<< HEAD
ArrayList<UserEntity> findAllUser();
UserEntity findAllUserByID(long id);

ArrayList<UserEntity> getUsersByAccountTypeAndName(String accountType, String name);
ArrayList<UserEntity> findAllUserByName(String name);
UserEntity addUser(UserEntity userEntity);
void deleteAllData();

void deleteUserById(long id);
=======
=======
>>>>>>> a0febdee0bcdde0e028d644780b30ec974d06eb7
    ArrayList<UserEntity> findAllUsers();
    UserEntity findAllUsersByID(long id);
    ArrayList<UserEntity> findAllUsersByName(String name);
    UserEntity addUser(UserEntity userEntity);
    void deleteAllData();
    void deleteUserById(long id);
<<<<<<< HEAD
>>>>>>> de166c4f29a731e87db86f6054fa8fe559f4b808
=======
>>>>>>> a0febdee0bcdde0e028d644780b30ec974d06eb7

}