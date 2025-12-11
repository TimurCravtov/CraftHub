package utm.server.modules.users;

import utm.server.modules.jwt.JwtTokenPair;
import utm.server.modules.users.dto.UserDto;
import utm.server.modules.authentication.dto.UserSignInDTO;
import utm.server.modules.authentication.dto.UserSignUpDTO;


import java.util.List;

public interface UserService {
    List<UserDto> findAllUser();

    List<UserDto> getUsersByAccountTypeAndName(String accountType, String name);

    List<UserDto> findAllUserByName(String name);

    UserDto addUser(UserEntity userEntity);

    UserDto findUserById(Long id);

    void deleteAllData();

    public JwtTokenPair signUp(UserSignUpDTO request);

    public JwtTokenPair signIn(UserSignInDTO request);

    void deleteUserById(long id);
    
    // Add this method
    void processOAuthPostLogin(String email);

    void addRoleToUser(String email, String roleName);

    void banUser(Long userId);
}
