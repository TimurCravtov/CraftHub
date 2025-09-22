package utm.server.features.authentication.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utm.server.features.authentication.dto.UpdateUserDTO;
import utm.server.features.authentication.dto.UserSignInDTO;
import utm.server.features.authentication.dto.UserSignUpDTO;
import utm.server.features.authentication.service.AuthService;
import utm.server.features.jwt.JwtService;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.jwt.RefreshRequest;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authenticationService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserSignUpDTO request) {
        try {
            JwtTokenPair tokenPair = authenticationService.signUp(request);
            return ResponseEntity.ok(tokenPair);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "SignUp Error: " + e.getMessage()));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody UserSignInDTO request) {
        try {
            JwtTokenPair tokenPair = authenticationService.signIn(request);
            return ResponseEntity.ok(tokenPair);
        } catch (RuntimeException e) {
            if ("2FA_REQUIRED".equals(e.getMessage())) {
                UserEntity user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                return ResponseEntity.ok(Map.of(
                        "requires2FA", true,
                        "userId", user.getId()
                ));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "SignIn Error: " + e.getMessage()));
        }
    }

    @PostMapping("/me/enable-2fa")
    public ResponseEntity<?> enableTwoFactorAuthentication(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = authenticationService.getUserIdFromToken(token);

            String qrBase64 = authenticationService.enableTwoFactorAuthentication(userId);
            return ResponseEntity.ok(Map.of("qrCode", qrBase64));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Enable 2FA Error: " + e.getMessage()));
        }
    }

    @PostMapping("/me/confirm-2fa")
    public ResponseEntity<?> confirmTwoFactorAuthentication(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = authenticationService.getUserIdFromToken(token);
            String code = request.get("code");

            authenticationService.confirmTwoFactorAuthentication(userId, code);

            return ResponseEntity.ok(Map.of("message", "2FA successfully enabled"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactor(@RequestBody Map<String, String> body) {
        try {
            Long userId = Long.parseLong(body.get("userId"));
            String code = body.get("code");

            JwtTokenPair tokenPair = authenticationService.verifyTwoFactorSignIn(userId, code);

            return ResponseEntity.ok(tokenPair);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid 2FA code: " + e.getMessage()));
        }
    }

    @PutMapping("/update-user")
    public ResponseEntity<?> updateUser(
            @RequestBody UpdateUserDTO request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = authenticationService.getUserIdFromToken(token);
            UserEntity updatedUser = authenticationService.updateUser(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Update Error: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest request) {
        try {
            Long userId = jwtService.extractUserId(request.refreshToken());
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            JwtTokenPair newPair = jwtService.refreshAccessToken(request.refreshToken(), user);
            return ResponseEntity.ok(newPair);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Refresh Error: " + e.getMessage()));
        }
    }
}
