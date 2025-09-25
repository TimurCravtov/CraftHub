package utm.server.features.authentication.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserSignUpDTO signUpDTO, HttpServletResponse response) {
        try {
            JwtTokenPair tokenPair = authService.signUp(signUpDTO);

            // Set refresh token as HTTP-only cookie
            setRefreshTokenCookie(response, tokenPair.getRefreshToken());

            // Only return access token in response body
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("accessToken", tokenPair.getAccessToken());

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Sign up failed: " + e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody UserSignInDTO signInDTO, HttpServletResponse response) {
        try {
            JwtTokenPair tokenPair = authService.signIn(signInDTO);

            // Set refresh token as HTTP-only cookie
            setRefreshTokenCookie(response, tokenPair.getRefreshToken());

            // Only return access token in response body
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("accessToken", tokenPair.getAccessToken());

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Sign in failed: " + e.getMessage());
        }
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true); // Prevents XSS attacks
        refreshCookie.setSecure(true); // Only send over HTTPS in production
        refreshCookie.setPath("/"); // Available for entire application
        refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days

        response.addCookie(refreshCookie);

        // Manually set SameSite attribute via Set-Cookie header
        String cookieValue = String.format(
                "refreshToken=%s; Path=/; Max-Age=%d; HttpOnly; Secure; SameSite=Strict",
                refreshToken,
                7 * 24 * 60 * 60);
        response.setHeader("Set-Cookie", cookieValue);
    }

    @PostMapping("/me/enable-2fa")
    public ResponseEntity<?> enableTwoFactorAuthentication(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = authService.getUserIdFromToken(token);

            String qrBase64 = authService.enableTwoFactorAuthentication(userId);
            return ResponseEntity.ok(Map.of("qrCode", qrBase64));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Enable 2FA Error: " + e.getMessage()));
        }
    }

    @PostMapping("/me/confirm-2fa")
    public ResponseEntity<?> confirmTwoFactorAuthentication(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = authService.getUserIdFromToken(token);
            String code = request.get("code");

            authService.confirmTwoFactorAuthentication(userId, code);

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

            JwtTokenPair tokenPair = authService.verifyTwoFactorSignIn(userId, code);

            return ResponseEntity.ok(tokenPair);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid 2FA code: " + e.getMessage()));
        }
    }

    @PutMapping("/update-user")
    public ResponseEntity<?> updateUser(
            @RequestBody UpdateUserDTO request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = authService.getUserIdFromToken(token);
            UserEntity updatedUser = authService.updateUser(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Update Error: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Extract refresh token from cookies
            String refreshToken = extractRefreshTokenFromCookies(request);

            if (refreshToken == null) {
                return ResponseEntity.badRequest().body("Refresh token not found");
            }

            JwtTokenPair newTokenPair = authService.refreshToken(refreshToken);

            // Set new refresh token as cookie
            setRefreshTokenCookie(response, newTokenPair.getRefreshToken());

            // Only return access token in response body
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("accessToken", newTokenPair.getAccessToken());

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Token refresh failed: " + e.getMessage());
        }
    }

    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear the refresh token cookie with SameSite attribute
        String cookieValue = "refreshToken=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict";
        response.setHeader("Set-Cookie", cookieValue);

        return ResponseEntity.ok().body("Logged out successfully");
    }
}
