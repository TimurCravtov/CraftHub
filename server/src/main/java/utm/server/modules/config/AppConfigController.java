package utm.server.modules.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class AppConfigController {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri:}")
    private String googleRedirectUri;

    @GetMapping("/auth-params")
    public ResponseEntity<Map<String, String>> getAuthParams() {
        Map<String, String> config = new HashMap<>();
        config.put("googleClientId", googleClientId);
        config.put("googleRedirectUri", googleRedirectUri);
        return ResponseEntity.ok(config);
    }
}
