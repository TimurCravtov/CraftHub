package utm.server.modules.authentication.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpEntity;

public interface OAuthProviderConfig {
    OAuthProvider getProvider();
    String getTokenUrl();
    String getUserInfoUrl();
    String getClientId();
    String getClientSecret();
    String getRedirectUri();
    HttpEntity<String> buildTokenRequest(String code, String redirectUri);
    OAuthUser extractUserData(JsonNode userInfoJson);
}

