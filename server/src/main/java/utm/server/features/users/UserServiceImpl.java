package utm.server.features.users;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
// import java.util.List;

// import utm.server.features.users.UserRequestDTO;
// import utm.server.features.users.UserEntity;
// import utm.server.features.users.UserService;
// import utm.server.features.users.UserMapper;

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
        return UserMapper.toDTO(userEntity); // Assuming UserMapper.toDTO exists
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
}