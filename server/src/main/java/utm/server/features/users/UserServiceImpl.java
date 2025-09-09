package utm.server.features.users;


import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import utm.server.features.jwt.JwtService;
import utm.server.features.jwt.JwtTokenPair;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ArrayList<UserRequestDTO> findAllUser(){
        
        var user_entities =  (ArrayList<UserEntity>) userRepository.findAll();
        return UserMapper.toDTOs(user_entities);
    }


    @Override
    public ArrayList<UserRequestDTO> findAllUserByName(String name){

        ArrayList<UserEntity> user_entities = userRepository.findByName(name);
        return UserMapper.toDTOs(user_entities);
    }

   @Override
   public ArrayList<UserRequestDTO> getUsersByAccountTypeAndName(String accountType, String name){
        ArrayList<UserEntity> user_entities =
                userRepository.findByAccountTypeAndName(accountType, name);
       return UserMapper.toDTOs(user_entities);
    }

    @Override
    public UserRequestDTO addUser(UserEntity userEntity){

        String encodedPassword = passwordEncoder.encode(userEntity.getPassword());
        userEntity.setPassword(encodedPassword);
        userRepository.save(userEntity);

        return UserMapper.toDTO(userEntity);
    }

    @Override
    public void deleteAllData(){
        userRepository.deleteAll();
    }

    @Override
    public void deleteUserById(long id){
        if(!userRepository.existsById(id)){
            throw new RuntimeException("User with id " + id + " not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public JwtTokenPair signUp(UserSignUpDTO request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        UserEntity newUser = new UserEntity();
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setAccountType(request.getAccountType());
        userRepository.save(newUser);

        String accessToken = jwtService.getJwtTokenPair(newUser).accessToken();
        String refreshToken = jwtService.getJwtTokenPair(newUser).refreshToken();
        return new JwtTokenPair(accessToken, refreshToken);
    }

   @Override
   public JwtTokenPair signIn(UserSignInDTO request){
        Optional<UserEntity> optionalUser = Optional.ofNullable(userRepository.findByEmail(request.getEmail()));

        if(!optionalUser.isPresent()){
            throw new RuntimeException("User not found");
        }

        UserEntity user = optionalUser.get();

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid credentials");
        }

       String accessToken = jwtService.getJwtTokenPair(user).accessToken();
       String refreshToken = jwtService.getJwtTokenPair(user).refreshToken();
       return new JwtTokenPair(accessToken, refreshToken);
   }
}
