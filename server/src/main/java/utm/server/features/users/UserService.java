package utm.server.features.users;

import java.util.ArrayList;


public interface UserService {
ArrayList<UserEntity> findAllUser();
UserEntity findAllUserByID(long id);
ArrayList<UserEntity> findAllUserByName(String name);
UserEntity addUser(UserEntity userEntity);
void deleteAllData();

void deleteUserById(long id);

}