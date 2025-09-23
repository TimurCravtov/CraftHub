package utm.server.features.authentication.oauth;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;
import utm.server.features.authentication.oauth.OAuthService;
import utm.server.features.jwt.JwtTokenPair;


@RestController
@RequestMapping("api/oauth")
public class OAuthController {

    private final OAuthService oAuthService;

    public OAuthController(OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @PostMapping("/{provider}")
    public ResponseEntity<?> oauthCallback(
            @PathVariable("provider") String providerName,
            @RequestBody Code code
    ) throws JsonProcessingException {

        OAuthProvider provider;

        try {
            provider = OAuthProvider.valueOf(providerName.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Unsupported OAuth provider: " + providerName);
        }

        JwtTokenPair tokens = oAuthService.authViaCode(code.getCode(), provider);
        return ResponseEntity.status(HttpStatus.CREATED).body(tokens);
    }
}
