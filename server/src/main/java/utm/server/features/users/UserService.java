package utm.server.features.users;

import java.util.ArrayList;


public interface UserService {
    ArrayList<UserEntity> findAllUsers();
    UserEntity findAllUsersByID(long id);
    ArrayList<UserEntity> findAllUsersByName(String name);
    UserEntity addUser(UserEntity userEntity);
    void deleteAllData();
    void deleteUserById(long id);

}