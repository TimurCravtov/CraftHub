package utm.server.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import utm.server.features.authentication.service.CustomOAuth2User;
import utm.server.features.jwt.JwtService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;

    @Value("${client.base.url:http://localhost:3000}")
    private String clientBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        String email = null;

        if (authentication.getPrincipal() instanceof CustomOAuth2User customUser) {
            email = customUser.getEmail();
        } else if (authentication.getPrincipal() instanceof org.springframework.security.oauth2.core.user.OAuth2User oauth2User) {
            email = oauth2User.getAttribute("email");
        }

        if (email == null) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Could not extract email");
            return;
        }

        String token = jwtService.generateToken(email);
        String redirectUrl = clientBaseUrl + "/oauth2/redirect?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}
