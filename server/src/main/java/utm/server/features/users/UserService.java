package utm.server.features.users;

import java.util.ArrayList;

public interface UserService {
    ArrayList<UserRequestDTO> findAllUser();
    ArrayList<UserRequestDTO> getUsersByAccountTypeAndName(String accountType, String name);
    ArrayList<UserRequestDTO> findAllUserByName(String name);
    UserRequestDTO addUser(UserEntity userEntity);
    void deleteAllData();
    void deleteUserById(long id);
    
    // Add this method
    void processOAuthPostLogin(String email);
}