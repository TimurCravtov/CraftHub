package utm.server.features.authentication.oauth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import utm.server.features.authentication.dto.AuthProvider;
import utm.server.features.authentication.oauth.OAuthProvider;
import utm.server.features.authentication.oauth.OAuthProviderConfig;
import utm.server.features.authentication.service.AuthService;
import utm.server.features.jwt.JwtService;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.UserEntity;

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
            JwtService jwtService
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.authService = authService;
        this.jwtService = jwtService;
        this.providerConfigs = configs.stream()
                .collect(Collectors.toMap(OAuthProviderConfig::getProvider, cfg -> cfg));
    }

    public JwtTokenPair authViaCode(String code, OAuthProvider provider) throws JsonProcessingException {
        OAuthProviderConfig config = providerConfigs.get(provider);

        // Exchange code for access token
        ResponseEntity<String> tokenResp = restTemplate.postForEntity(
                config.getTokenUrl(),
                config.buildTokenRequest(code),
                String.class
        );

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
                String.class
        );

        OAuthUser oAuthUser = config.extractUserData(objectMapper.readTree(userResp.getBody()));
        UserEntity user = authService.createOrGetUser(oAuthUser);

        return jwtService.getJwtTokenPair(user);
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
