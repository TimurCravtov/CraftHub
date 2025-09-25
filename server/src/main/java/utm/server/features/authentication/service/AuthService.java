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
import utm.server.features.authentication.dto.AuthProvider;
import utm.server.features.authentication.oauth.OAuthUser;
import utm.server.features.jwt.JwtService;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;
import utm.server.features.users.AccountType;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public JwtTokenPair signUp(UserSignUpDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        UserEntity newUser = new UserEntity();
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        AuthProvider provider = request.getProvider() != null ? request.getProvider() : AuthProvider.LOCAL;
        newUser.setProvider(provider);

        if (provider == AuthProvider.LOCAL) {
            if (request.getAccountType() == null) {
                throw new RuntimeException("Account type is required for local sign up");
            }
            newUser.setAccountType(request.getAccountType());
        } else {
            newUser.setAccountType(AccountType.BUYER);
        }

        userRepository.save(newUser);
        return jwtService.getJwtTokenPair(newUser);
    }

    public UserEntity createOrGetUser(OAuthUser oauthUser) {

        UserEntity user = userRepository
                .findByProviderAndProviderId(AuthProvider.valueOf(oauthUser.getProvider().toUpperCase()),
                        oauthUser.getProviderId())
                .orElse(null);

        if (user == null) {
            user = new UserEntity();
            user.setEmail(oauthUser.getEmail());
            user.setName(oauthUser.getName());
            user.setPassword("NO PASS");
            user.setAccountType(AccountType.BUYER);
            user.setProvider(AuthProvider.valueOf(oauthUser.getProvider().toUpperCase()));
            user.setProviderId(oauthUser.getProviderId());
            return userRepository.save(user);
        }

        return user;

    }

    public JwtTokenPair signIn(UserSignInDTO request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (user.isTwoFactorEnabled()) {
            throw new RuntimeException("2FA_REQUIRED");
        }

        return jwtService.getJwtTokenPair(user);
    }

    public String enableTwoFactorAuthentication(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isTwoFactorEnabled()) {
            throw new RuntimeException("2FA already enabled");
        }

        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        GoogleAuthenticatorKey key = gAuth.createCredentials();

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

        user.setTwoFactorSecret(tempSecret);
        user.setTwoFactorEnabled(true);
        user.setTempTwoFactorSecret(null);
        userRepository.save(user);
    }

    public JwtTokenPair verifyTwoFactorCode(Long userId, String code) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTwoFactorSecret() == null) {
            throw new RuntimeException("2FA not enabled");
        }

        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        boolean isCodeValid = gAuth.authorize(user.getTwoFactorSecret(), Integer.parseInt(code));

        if (!isCodeValid) {
            throw new RuntimeException("Invalid 2FA code");
        }

        return jwtService.getJwtTokenPair(user);
    }

    public JwtTokenPair verifyTwoFactorSignIn(Long userId, String code) {
        return verifyTwoFactorCode(userId, code); // reutilizare cod
    }

    public UserEntity updateUser(Long userId, UpdateUserDTO request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null
                    || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is required to set a new password");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        if (request.getNewEmail() != null && !request.getNewEmail().isBlank()) {
            if (userRepository.existsByEmail(request.getNewEmail())
                    && !request.getNewEmail().equals(user.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(request.getNewEmail());
        }

        if (request.getNewName() != null && !request.getNewName().isBlank()) {
            user.setName(request.getNewName());
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                user.setAccountType(
                        AccountType.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + request.getRole());
            }
        }

        userRepository.save(user);
        return user;
    }

    public Long getUserIdFromToken(String token) {
        return jwtService.extractUserId(token);
    }

    // Make sure your refreshToken method accepts a String parameter
    public JwtTokenPair refreshToken(String refreshToken) {
        try {
            // Validate the refresh token and extract user ID
            Long userId = jwtService.extractUserId(refreshToken);

            // Check if the refresh token is valid (not expired)
            if (!jwtService.isTokenValid(refreshToken)) {
                throw new RuntimeException("Invalid or expired refresh token");
            }

            // Get the user from database
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate new token pair
            return jwtService.getJwtTokenPair(user);

        } catch (Exception e) {
            throw new RuntimeException("Failed to refresh token: " + e.getMessage());
        }
    }
}
