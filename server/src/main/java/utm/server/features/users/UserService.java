package utm.server.features.users;

import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.dto.UserDto;
import utm.server.features.authentication.dto.UserSignInDTO;
import utm.server.features.authentication.dto.UserSignUpDTO;


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

}
