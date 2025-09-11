package utm.server.authentication.controller;

import lombok.RequiredArgsConstructor;
import utm.server.authentication.dto.UserSignInDTO;
import utm.server.authentication.dto.UserSignUpDTO;
import utm.server.authentication.service.AuthService;
import utm.server.features.jwt.JwtTokenPair;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authenticationService;

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
        @RequestParam Long userId,
        @RequestParam String twoFactorType,
        @RequestParam(required = false) String phoneNumber
    ) {
        try {
            String result = authenticationService.enableTwoFactorAuthentication(userId, twoFactorType, phoneNumber);
            return ResponseEntity.ok(result);
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
}