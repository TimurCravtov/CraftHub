package utm.server.modules.authentication.oauth;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import utm.server.modules.authentication.service.AuthService;
import utm.server.modules.jwt.JwtService;
import utm.server.modules.jwt.JwtTokenPair;
import utm.server.modules.users.UserEntity;
import utm.server.modules.users.UserMapper;
import utm.server.modules.users.UserRepository;
import utm.server.modules.users.dto.UserDto;

import java.util.HashMap;
import java.util.Map;

import static utm.server.modules.authentication.service.CookieService.setRefreshTokenCookie;

@RestController
@RequestMapping("api/oauth")
public class OAuthController {

    private final OAuthService oAuthService;
    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public OAuthController(OAuthService oAuthService, AuthService authService, JwtService jwtService, UserRepository userRepository, UserMapper userMapper) {
        this.oAuthService = oAuthService;
        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @PostMapping("/{provider}")
    public ResponseEntity<?> oauthCallback(
            HttpServletResponse response,
            @PathVariable("provider") String providerName,
            @RequestBody Code code) throws JsonProcessingException {

        OAuthProvider provider;

        try {
            provider = OAuthProvider.valueOf(providerName.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Unsupported OAuth provider: " + providerName);
        }

        try {
            JwtTokenPair tokens = oAuthService.authViaCode(code.getCode(), code.getRedirectUri(), provider);
            setRefreshTokenCookie(response, tokens.refreshToken());

            Long userId = jwtService.extractUserId(tokens.accessToken());
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            UserDto userDto = userMapper.toDTO(user);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("accessToken", tokens.accessToken());
            responseBody.put("user", userDto);

            return ResponseEntity.status(HttpStatus.CREATED).body(responseBody);
        } catch (OAuthService.TwoFactorRequiredException e) {
            // Return a response indicating 2FA is required
            return ResponseEntity
                    .status(HttpStatus.ACCEPTED) // 202 Accepted
                    .body(new TwoFactorRequiredResponse(
                            true,
                            "2FA verification required",
                            e.getEmail(),
                            e.getProvider()));
        } catch (RuntimeException e) {
            if ("2FA_REQUIRED".equals(e.getMessage())) {
                // Fallback for generic 2FA required
                return ResponseEntity
                        .status(HttpStatus.ACCEPTED)
                        .body(new TwoFactorRequiredResponse(
                                true,
                                "2FA verification required",
                                null,
                                providerName));
            }
            throw e;
        }
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactorForOAuth(
            HttpServletResponse response,
            @RequestBody TwoFactorVerifyRequest request) {
        try {
            JwtTokenPair tokens = authService.verifyTwoFactorForOAuth(
                    request.email(),
                    request.provider(),
                    request.code());
            setRefreshTokenCookie(response, tokens.refreshToken());

            return ResponseEntity.ok(tokens);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // Response class for 2FA required
    private record TwoFactorRequiredResponse(
            boolean twoFactorRequired,
            String message,
            String email,
            String provider) {
    }

    // Request class for 2FA verification
    private record TwoFactorVerifyRequest(
            String email,
            String provider,
            String code) {
    }

    // Error response
    private record ErrorResponse(String message) {
    }
}
