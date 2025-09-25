package utm.server.features.jwt;

public record JwtTokenPair(String accessToken, String refreshToken) {
    public String getAccessToken() {
        return accessToken();
    }

    public String getRefreshToken() {
        return refreshToken();
    }
}
