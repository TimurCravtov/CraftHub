package utm.server.modules.authentication.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
public class GoogleOAuthProviderConfig implements OAuthProviderConfig {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirectUri;

    @Override public OAuthProvider getProvider() { return OAuthProvider.GOOGLE; }

    @Override public String getTokenUrl() { return "https://oauth2.googleapis.com/token"; }

    @Override public String getUserInfoUrl() { return "https://www.googleapis.com/oauth2/v2/userinfo"; }

    @Override public String getClientId() { return clientId; }

    @Override public String getClientSecret() { return clientSecret; }

    @Override public String getRedirectUri() { return redirectUri; }

    @Override
    public HttpEntity<String> buildTokenRequest(String code) {
        String body = String.format(
                "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
                code, clientId, clientSecret, redirectUri
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return new HttpEntity<>(body, headers);
    }

    @Override
    public OAuthUser extractUserData(JsonNode json) {

        OAuthUser user = new OAuthUser();

        user.setProviderId(json.get("id").asText());
        user.setProvider("GOOGLE");
        user.setName(json.get("name").asText());
        user.setEmail(json.get("email").asText());

        return user;
    }
}
