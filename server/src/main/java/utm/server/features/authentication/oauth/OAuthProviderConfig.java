package utm.server.features.authentication.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpEntity;

import java.util.Map;

public interface OAuthProviderConfig {
    OAuthProvider getProvider();
    String getTokenUrl();
    String getUserInfoUrl();
    String getClientId();
    String getClientSecret();
    String getRedirectUri();
    HttpEntity<String> buildTokenRequest(String code);
    OAuthUser extractUserData(JsonNode userInfoJson);
}

