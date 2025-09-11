package utm.server.features.users;

import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.dto.UserRequestDTO;
import utm.server.features.users.dto.UserSignInDTO;
import utm.server.features.users.dto.UserSignUpDTO;

import java.util.ArrayList;
import java.util.List;


public interface UserService {

List<UserRequestDTO> findAllUser();

List<UserRequestDTO> getUsersByAccountTypeAndName(String accountType, String name);
List<UserRequestDTO> findAllUserByName(String name);
UserRequestDTO addUser(UserEntity userEntity);
void deleteAllData();

public JwtTokenPair signUp(UserSignUpDTO request);

public JwtTokenPair signIn(UserSignInDTO request);




void deleteUserById(long id);




}