package utm.server.modules.authentication.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

public class CookieService {
    public static void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true); // Prevents XSS attacks
        refreshCookie.setSecure(true); // Only send over HTTPS in production
        refreshCookie.setPath("/"); // Available for entire application
        refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days

        response.addCookie(refreshCookie);

        // Manually set SameSite attribute via Set-Cookie header
        String cookieValue = String.format(
                "refreshToken=%s; Path=/; Max-Age=%d; HttpOnly; Secure; SameSite=None",
                refreshToken,
                7 * 24 * 60 * 60);
        response.setHeader("Set-Cookie", cookieValue);
    }
}
