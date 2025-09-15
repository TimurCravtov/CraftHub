package utm.server.authentication.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import utm.server.authentication.dto.UserSignInDTO;
import utm.server.authentication.dto.UserSignUpDTO;
import utm.server.authentication.dto.UpdateUserDTO;
import utm.server.authentication.model.TwoFactorData;
import utm.server.features.jwt.JwtService;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.secret.SecretGenerator;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final SecretGenerator secretGenerator;
    private final CodeVerifier codeVerifier;

    @Override
    public JwtTokenPair signUp(UserSignUpDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        UserEntity newUser = new UserEntity(
            request.getName(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            request.getAccountType()
        );
        TwoFactorData twoFactorData = new TwoFactorData();
        twoFactorData.setUser(newUser);
        newUser.setTwoFactorData(twoFactorData);
        userRepository.save(newUser);
        return jwtService.getJwtTokenPair(newUser);
    }

    @Override
    public JwtTokenPair signIn(UserSignInDTO request) {
        Optional<UserEntity> optionalUser = Optional.ofNullable(userRepository.findByEmail(request.getEmail()));
        if (!optionalUser.isPresent()) {
            throw new RuntimeException("User not found");
        }
        UserEntity user = optionalUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        TwoFactorData twoFactorData = user.getTwoFactorData();
        if (twoFactorData == null) {
            twoFactorData = new TwoFactorData();
            twoFactorData.setUser(user);
            user.setTwoFactorData(twoFactorData);
            userRepository.save(user);
        }
        if (twoFactorData.isTwoFactorEnabled()) {
            throw new RuntimeException("TOTP 2FA required - please provide code");
        }
        return jwtService.getJwtTokenPair(user);
    }

    @Override
    public String enableTwoFactorAuthentication(Long userId) {
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        TwoFactorData twoFactorData = user.getTwoFactorData();
        if (twoFactorData == null) {
            twoFactorData = new TwoFactorData();
            twoFactorData.setUser(user);
            user.setTwoFactorData(twoFactorData);
        }
        
        // Generate TOTP secret and enable 2FA
        twoFactorData.setTwoFactorSecret(secretGenerator.generate());
        twoFactorData.setTwoFactorEnabled(true);
        userRepository.save(user);
        
        return twoFactorData.getTwoFactorSecret();
    }

    @Override
    public boolean verifyTwoFactorCode(Long userId, String code) {
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        TwoFactorData twoFactorData = user.getTwoFactorData();
        if (twoFactorData == null) return false;
        if (twoFactorData.isTwoFactorEnabled() && twoFactorData.getTwoFactorSecret() != null) {
            return codeVerifier.isValidCode(twoFactorData.getTwoFactorSecret(), code);
        }
        return false;
    }

    @Override
    public JwtTokenPair verifyTwoFactorSignIn(Long userId, String code) {
        if (verifyTwoFactorCode(userId, code)) {
            UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            return jwtService.getJwtTokenPair(user);
        }
        throw new RuntimeException("Invalid 2FA code");
    }

    // 🔹 Update user
    @Override
    public UserEntity updateUser(Long userId, UpdateUserDTO request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        if (request.getNewEmail() != null && !request.getNewEmail().isBlank()) {
            if (userRepository.existsByEmail(request.getNewEmail()) &&
                !request.getNewEmail().equals(user.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(request.getNewEmail());
        }

        if (request.getNewName() != null && !request.getNewName().isBlank()) {
            user.setName(request.getNewName());
        }

        userRepository.save(user);
        return user;
    }

    @Override
    public Long getUserIdFromToken(String token) {
        return jwtService.extractUserId(token);
    }
}