package utm.server.features.users;

import java.util.ArrayList;


public interface UserService {
<<<<<<< HEAD
ArrayList<UserEntity> findAllUser();
UserEntity findAllUserByID(long id);

ArrayList<UserEntity> getUsersByAccountTypeAndName(String accountType, String name);
ArrayList<UserEntity> findAllUserByName(String name);
UserEntity addUser(UserEntity userEntity);
void deleteAllData();

void deleteUserById(long id);
=======
    ArrayList<UserEntity> findAllUsers();
    UserEntity findAllUsersByID(long id);
    ArrayList<UserEntity> findAllUsersByName(String name);
    UserEntity addUser(UserEntity userEntity);
    void deleteAllData();
    void deleteUserById(long id);
>>>>>>> de166c4f29a731e87db86f6054fa8fe559f4b808

}