package utm.server.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.concurrent.TimeUnit;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final Key key;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }
    private static final long ACCESS_TOKEN_EXPIRATION = TimeUnit.MINUTES.toMillis(5);
    private static final long REFRESH_TOKEN_EXPIRATION = TimeUnit.DAYS.toMillis(180);

}
