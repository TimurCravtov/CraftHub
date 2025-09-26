package utm.server.modules.jwt;

public record JwtTokenPair(String accessToken, String refreshToken) {
    public String getAccessToken() {
        return accessToken();
    }

    public String getRefreshToken() {
        return refreshToken();
    }
}
