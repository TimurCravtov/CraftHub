package utm.server.features.authentication.oauth;

import lombok.Data;

@Data
public class OAuthUser {
    String providerId;
    String name;
    String email;
    String provider;
}
