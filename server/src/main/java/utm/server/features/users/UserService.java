package utm.server.features.users;

import utm.server.features.jwt.JwtTokenPair;

import java.util.ArrayList;


public interface UserService {

ArrayList<UserRequestDTO> findAllUser();

ArrayList<UserRequestDTO> getUsersByAccountTypeAndName(String accountType, String name);
ArrayList<UserRequestDTO> findAllUserByName(String name);
UserRequestDTO addUser(UserEntity userEntity);
void deleteAllData();

public JwtTokenPair signUp(UserSignUpDTO request);

public JwtTokenPair signIn(UserSignInDTO request);

void deleteUserById(long id);




}