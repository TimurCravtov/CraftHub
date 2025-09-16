package utm.server.features.authentication.controller;

import lombok.RequiredArgsConstructor;
import utm.server.features.authentication.dto.UpdateUserDTO;
import utm.server.features.authentication.dto.UserSignInDTO;
import utm.server.features.authentication.dto.UserSignUpDTO;
import utm.server.features.authentication.service.AuthService;
import utm.server.features.jwt.JwtService;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.jwt.RefreshRequest;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                .body("SignUp Error: " + e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody UserSignInDTO request) {
        try {
            JwtTokenPair tokenPair = authenticationService.signIn(request);
            return ResponseEntity.ok(tokenPair);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("SignIn Error: " + e.getMessage());
        }
    }

    @PostMapping("/enable-2fa")
    public ResponseEntity<?> enableTwoFactorAuthentication(
        @RequestParam Long userId
    ) {
        try {
            String secret = authenticationService.enableTwoFactorAuthentication(userId);
            return ResponseEntity.ok(secret);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Enable 2FA Error: " + e.getMessage());
        }
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactorSignIn(
        @RequestParam Long userId,
        @RequestParam String code
    ) {
        try {
            JwtTokenPair tokenPair = authenticationService.verifyTwoFactorSignIn(userId, code);
            return ResponseEntity.ok(tokenPair);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("2FA Verification Error: " + e.getMessage());
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
                    .body("Update Error: " + e.getMessage());
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
                .body("Refresh Error: " + e.getMessage());
        }
    }
}