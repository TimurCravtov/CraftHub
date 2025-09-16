package utm.server.features.authentication.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import utm.server.features.authentication.dto.UpdateUserDTO;
import utm.server.features.authentication.dto.UserSignInDTO;
import utm.server.features.authentication.dto.UserSignUpDTO;
import utm.server.features.jwt.JwtService;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    
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

        userRepository.save(newUser);
        return jwtService.getJwtTokenPair(newUser);
    }

    @Override
    public JwtTokenPair signIn(UserSignInDTO request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // 🔹 Dacă userul are 2FA activ, NU returnăm token direct
        if (user.isTwoFactorEnabled()) {
            throw new RuntimeException("2FA_REQUIRED");
        }

        return jwtService.getJwtTokenPair(user);
    }

    // 🔹 Enable 2FA
    @Override
    public String enableTwoFactorAuthentication(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isTwoFactorEnabled()) {
            throw new RuntimeException("2FA already enabled");
        }

        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        GoogleAuthenticatorKey key = gAuth.createCredentials();

        // Salvează doar secretul temporar
        user.setTempTwoFactorSecret(key.getKey());
        userRepository.save(user);

        String otpAuthUrl = "otpauth://totp/MyApp:" + user.getEmail()
                + "?secret=" + key.getKey()
                + "&issuer=MyApp";

        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            var bitMatrix = qrCodeWriter.encode(otpAuthUrl, BarcodeFormat.QR_CODE, 250, 250);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);

            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (WriterException | java.io.IOException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    // 🔹 Confirm 2FA (noua metodă)
    @Override
    public void confirmTwoFactorAuthentication(Long userId, String code) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String tempSecret = user.getTempTwoFactorSecret();
        if (tempSecret == null || tempSecret.isBlank()) {
            throw new RuntimeException("No 2FA setup in progress");
        }

        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        boolean isValid = gAuth.authorize(tempSecret, Integer.parseInt(code));

        if (!isValid) {
            throw new RuntimeException("Invalid 2FA code");
        }

        // Confirmăm 2FA: mutăm secretul temporar în secretul oficial
        user.setTwoFactorSecret(tempSecret);
        user.setTwoFactorEnabled(true);
        user.setTempTwoFactorSecret(null); // ștergem secretul temporar
        userRepository.save(user);
    }

    // 🔹 Verify 2FA login
  @Override
public JwtTokenPair verifyTwoFactorCode(Long userId, String code) {
    UserEntity user = userRepository.findById(userId).orElseThrow();
    GoogleAuthenticator gAuth = new GoogleAuthenticator();

    if (user.getTwoFactorSecret() == null) {
        throw new RuntimeException("2FA not enabled");
    }

    boolean isCodeValid = gAuth.authorize(user.getTwoFactorSecret(), Integer.parseInt(code));
    if (!isCodeValid) {
        throw new RuntimeException("Invalid 2FA code");
    }

    return jwtService.getJwtTokenPair(user);
}


@Override
public JwtTokenPair verifyTwoFactorSignIn(Long userId, String code) {
    UserEntity user = userRepository.findById(userId).orElseThrow();
    GoogleAuthenticator gAuth = new GoogleAuthenticator();

    if (user.getTwoFactorSecret() == null) {
        throw new RuntimeException("2FA not enabled");
    }

    boolean isCodeValid = gAuth.authorize(user.getTwoFactorSecret(), Integer.parseInt(code));
    if (!isCodeValid) {
        throw new RuntimeException("Invalid 2FA code");
    }

    return jwtService.getJwtTokenPair(user);
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
