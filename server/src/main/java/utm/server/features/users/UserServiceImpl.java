package utm.server.features.users;

import lombok.RequiredArgsConstructor;
import utm.server.features.authentication.dto.AuthProvider;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ArrayList<UserRequestDTO> findAllUser() {
        var user_entities = (ArrayList<UserEntity>) userRepository.findAll();
        return UserMapper.toDTOs(user_entities);
    }

    @Override
    public ArrayList<UserRequestDTO> findAllUserByName(String name) {
        ArrayList<UserEntity> user_entities = userRepository.findByName(name);
        return UserMapper.toDTOs(user_entities);
    }

    @Override
    public ArrayList<UserRequestDTO> getUsersByAccountTypeAndName(String accountType, String name) {
        ArrayList<UserEntity> user_entities = userRepository.findByAccountTypeAndName(accountType, name);
        return UserMapper.toDTOs(user_entities);
    }

    @Override
    public UserRequestDTO addUser(UserEntity userEntity) {
        String encodedPassword = passwordEncoder.encode(userEntity.getPassword());
        userEntity.setPassword(encodedPassword);
        userRepository.save(userEntity);
        return UserMapper.toDTO(userEntity);
    }

    @Override
    public void deleteAllData() {
        userRepository.deleteAll();
    }

    @Override
    public void deleteUserById(long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User with id " + id + " not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public void processOAuthPostLogin(String email) {
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            UserEntity newUser = new UserEntity();
            newUser.setEmail(email);
            newUser.setName("Google User");
            newUser.setProvider(AuthProvider.GOOGLE);
            newUser.setPassword("oauth2_user_no_password");
            newUser.setAccountType("USER");
            
            userRepository.save(newUser);
        } else {
            user.setProvider(AuthProvider.GOOGLE);
            userRepository.save(user);
        }
    }
}