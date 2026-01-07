package utm.server.modules.security;

import java.time.Duration;

/**
 * Configuration holder for rate limit settings
 */
public class RateLimitConfig {
    private final long capacity;
    private final long refillTokens;
    private final String refillDuration;
    private final String key;
    private final Duration duration;

    public RateLimitConfig(long capacity, long refillTokens, String refillDuration, String key) {
        this.capacity = capacity;
        this.refillTokens = refillTokens;
        this.refillDuration = refillDuration;
        this.key = key;
        this.duration = Duration.parse(refillDuration);
    }

    public long getCapacity() {
        return capacity;
    }

    public long getRefillTokens() {
        return refillTokens;
    }

    public String getRefillDuration() {
        return refillDuration;
    }

    public String getKey() {
        return key;
    }

    public Duration getDuration() {
        return duration;
    }
}
