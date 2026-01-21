package utm.server.modules.authentication.oauth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import utm.server.modules.authentication.service.AuthService;
import utm.server.modules.jwt.JwtService;
import utm.server.modules.jwt.JwtTokenPair;
import utm.server.modules.users.UserEntity;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OAuthService {

    private final Map<OAuthProvider, OAuthProviderConfig> providerConfigs;
    private final RestOperations restTemplate;
    private final ObjectMapper objectMapper;
    private final AuthService authService;
    private final JwtService jwtService;

    public OAuthService(
            List<OAuthProviderConfig> configs,
            RestOperations restTemplate,
            ObjectMapper objectMapper,
            AuthService authService,
            JwtService jwtService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.authService = authService;
        this.jwtService = jwtService;
        this.providerConfigs = configs.stream()
                .collect(Collectors.toMap(OAuthProviderConfig::getProvider, cfg -> cfg));
    }

    public JwtTokenPair authViaCode(String code, String redirectUri, OAuthProvider provider) throws JsonProcessingException {
        OAuthProviderConfig config = providerConfigs.get(provider);

        // Exchange code for access token
        ResponseEntity<String> tokenResp = restTemplate.postForEntity(
                config.getTokenUrl(),
                config.buildTokenRequest(code, redirectUri),
                String.class);

        String accessToken = extractAccessToken(tokenResp.getBody());

        // Get user info
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> userResp = restTemplate.exchange(
                config.getUserInfoUrl(),
                HttpMethod.GET,
                entity,
                String.class);

        OAuthUser oAuthUser = config.extractUserData(objectMapper.readTree(userResp.getBody()));
        UserEntity user = authService.createOrGetUser(oAuthUser);

        // Check if 2FA is enabled for this user
        if (user.isTwoFactorEnabled()) {
            // Create a custom exception that carries user info
            TwoFactorRequiredException twoFactorException = new TwoFactorRequiredException(
                    "2FA verification required",
                    user.getEmail(),
                    provider.name());
            throw twoFactorException;
        }

        return jwtService.getJwtTokenPair(user);
    }

    // Custom exception to carry user info for 2FA
    public static class TwoFactorRequiredException extends RuntimeException {
        private final String email;
        private final String provider;

        public TwoFactorRequiredException(String message, String email, String provider) {
            super(message);
            this.email = email;
            this.provider = provider;
        }

        public String getEmail() {
            return email;
        }

        public String getProvider() {
            return provider;
        }
    }

    private String extractAccessToken(String body) {
        try {
            JsonNode node = objectMapper.readTree(body);
            return Optional.ofNullable(node.get("access_token"))
                    .map(JsonNode::asText)
                    .orElseThrow(() -> new RuntimeException("Access token not found"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse token", e);
        }
    }
}
