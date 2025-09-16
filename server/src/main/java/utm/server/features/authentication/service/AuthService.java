package utm.server.features.authentication.service;

import utm.server.features.authentication.dto.UpdateUserDTO;
import utm.server.features.authentication.dto.UserSignInDTO;
import utm.server.features.authentication.dto.UserSignUpDTO;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.UserEntity;

public interface AuthService {
    JwtTokenPair signUp(UserSignUpDTO request);
    JwtTokenPair signIn(UserSignInDTO request);
    String enableTwoFactorAuthentication(Long userId); 
    JwtTokenPair verifyTwoFactorCode(Long userId, String code);
    JwtTokenPair verifyTwoFactorSignIn(Long userId, String code);
    UserEntity updateUser(Long userId, UpdateUserDTO request);
    Long getUserIdFromToken(String token);

    // 🔹 Adăugăm metoda pentru confirmarea 2FA
    void confirmTwoFactorAuthentication(Long userId, String code);
    
}
