package utm.server.authentication.service;

import utm.server.authentication.dto.UserSignInDTO;
import utm.server.authentication.dto.UserSignUpDTO;
import utm.server.features.jwt.JwtTokenPair;

public interface AuthService {
    JwtTokenPair signUp(UserSignUpDTO request);
    JwtTokenPair signIn(UserSignInDTO request);
    String enableTwoFactorAuthentication(Long userId, String twoFactorType, String phoneNumber); // Updated to support type and phone number
    boolean verifyTwoFactorCode(Long userId, String code);
    JwtTokenPair verifyTwoFactorSignIn(Long userId, String code); // New method for 2FA sign-in
}