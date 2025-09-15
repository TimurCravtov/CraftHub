package utm.server.features.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import utm.server.features.users.UserEntity;

import java.security.Key;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
public class JwtService {

    private final Key key;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    private static final long ACCESS_TOKEN_EXPIRATION = TimeUnit.HOURS.toMillis(1); // 1 oră
    private static final long REFRESH_TOKEN_EXPIRATION = TimeUnit.DAYS.toMillis(180); // 6 luni

    public JwtTokenPair getJwtTokenPair(UserEntity user) {
        String accessToken = generateToken(user, true);
        String refreshToken = generateToken(user, false);

        // Debug log
        System.out.println(">>> JWT Service: Generated access token = " + accessToken);
        System.out.println(">>> JWT Service: Generated refresh token = " + refreshToken);

        return new JwtTokenPair(accessToken, refreshToken);
    }

    private String generateToken(UserEntity user, boolean isAccess) {
        long expirationTime = isAccess ? ACCESS_TOKEN_EXPIRATION : REFRESH_TOKEN_EXPIRATION;
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("username", user.getName())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            System.out.println(">>> JWT Service: Token expired");
            throw new IllegalArgumentException("Token has expired");
        } catch (JwtException e) {
            System.out.println(">>> JWT Service: Invalid token: " + e);
            throw new IllegalArgumentException("Invalid JWT token: " + e.toString());
        }
    }

    public Long extractUserId(String token) {
        Claims claims = validateToken(token);
        return Long.parseLong(claims.getSubject());
    }

    public JwtTokenPair refreshAccessToken(String refreshToken, UserEntity user) {
        Claims claims = validateToken(refreshToken);

        if (!claims.getSubject().equals(user.getId().toString())) {
            throw new IllegalArgumentException("Refresh token does not belong to this user");
        }

        String newAccessToken = generateToken(user, true);
        System.out.println(">>> JWT Service: Refreshed access token = " + newAccessToken);

        return new JwtTokenPair(newAccessToken, refreshToken);
    }
}
