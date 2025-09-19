package utm.server.features.users;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import utm.server.features.jwt.JwtService;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.dto.UserDto;
import utm.server.features.authentication.dto.UserSignUpDTO;
import utm.server.features.authentication.dto.AuthProvider;
import utm.server.features.authentication.dto.UserSignInDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Override
    public List<UserDto> findAllUser() {
        List<UserEntity> userEntities = userRepository.findAll();
        return userMapper.toDTOs(userEntities);
    }

    @Override
    public UserDto findUserById(Long id) {
        return userMapper.toDTO(userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id)));
    }

    @Override
    public List<UserDto> findAllUserByName(String name) {
        List<UserEntity> userEntities = userRepository.findByName(name);
        return userMapper.toDTOs(userEntities);
    }

    @Override
    public List<UserDto> getUsersByAccountTypeAndName(String accountType, String name) {
        List<UserEntity> userEntities = userRepository.findByAccountTypeAndName(AccountType.fromString(accountType), name);
        return userMapper.toDTOs(userEntities);
    }

    @Override
    public UserDto addUser(UserEntity userEntity) {
        String encodedPassword = passwordEncoder.encode(userEntity.getPassword());
        userEntity.setPassword(encodedPassword);
        userRepository.save(userEntity);
        return userMapper.toDTO(userEntity);
    }

    @Override
    public void deleteAllData() {
        userRepository.deleteAll();
    }

    @Override
    public JwtTokenPair signUp(UserSignUpDTO request) {
        return null;
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
            newUser.setAccountType(AccountType.valueOf("USER"));

            userRepository.save(newUser);
        } else {
            user.setProvider(AuthProvider.GOOGLE);
            userRepository.save(user);
        }
    }

    @Override
    public JwtTokenPair signIn(UserSignInDTO request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtService.getJwtTokenPair(user);
    }
}
