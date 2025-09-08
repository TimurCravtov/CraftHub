package utm.server.features.jwt;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import io.jsonwebtoken.security.Keys;
import utm.server.features.users.UserEntity;

@Service
public class JwtService {

    private final Key key;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }
    private static final long ACCESS_TOKEN_EXPIRATION = TimeUnit.MINUTES.toMillis(5);
    private static final long REFRESH_TOKEN_EXPIRATION = TimeUnit.DAYS.toMillis(180);

    public JwtTokenPair getJwtTokenPair(UserEntity user) {
        return new JwtTokenPair(generateToken(user, true), generateToken(user, false));
    }

    private String generateToken(UserEntity user, boolean isAccess) {
        long expirationTime = isAccess ? ACCESS_TOKEN_EXPIRATION : REFRESH_TOKEN_EXPIRATION;

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("username", user.getName())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            throw new IllegalArgumentException("Token has expired");
        } catch (JwtException e) {
            throw new IllegalArgumentException("Invalid JWT token" + e.toString());
        }
    }
}
