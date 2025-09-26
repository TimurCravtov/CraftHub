package utm.server.modules.users;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import utm.server.modules.jwt.JwtService;
import utm.server.modules.jwt.JwtTokenPair;
import utm.server.modules.users.dto.UserDto;
import utm.server.modules.authentication.dto.UserSignUpDTO;
import utm.server.modules.authentication.dto.AuthProvider;
import utm.server.modules.authentication.dto.UserSignInDTO;

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
        return userMapper.toDTOs(userRepository.findAll());
    }

    @Override
    public UserDto findUserById(Long id) {
        return userMapper.toDTO(userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id)));
    }

    @Override
    public List<UserDto> findAllUserByName(String name) {
        return userMapper.toDTOs(userRepository.findByName(name));
    }

    @Override
    public List<UserDto> getUsersByAccountTypeAndName(String provider, String name) {
        return userMapper.toDTOs(userRepository.findByProviderAndName(AuthProvider.valueOf(provider.toUpperCase()), name));
    }

    @Override
    public UserDto addUser(UserEntity userEntity) {
        userEntity.setPassword(passwordEncoder.encode(userEntity.getPassword()));
        userRepository.save(userEntity);
        return userMapper.toDTO(userEntity);
    }

    @Override
    public void deleteAllData() {
        userRepository.deleteAll();
    }

    @Override
    public JwtTokenPair signUp(UserSignUpDTO request) {
        return null; // implementare separată dacă e nevoie
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
            UserEntity newUser = new UserEntity(email, "Google User", AuthProvider.GOOGLE);
            newUser.setPassword("oauth2_user_no_password");
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
