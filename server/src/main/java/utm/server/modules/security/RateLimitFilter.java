package utm.server.modules.security;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.*;

// RateLimitFilter.java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private final LoadingCache<String, Bucket> cache;

    @Value("${rate-limit.capacity:30}")
    private long capacity;

    @Value("${rate-limit.refill-tokens:30}")
    private long refillTokens;

    @Value("${rate-limit.refill-duration:1m}")
    private String refillDuration;

    public RateLimitFilter() {
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .maximumSize(10_000)
                .build(key -> createBucket());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain filterChain) throws jakarta.servlet.ServletException, IOException {
        String key = getClientIp(request);
        var bucket = cache.get(key, ip -> createBucket());

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            sendRateLimitResponse(response, waitSeconds);
        }
    }

    private Bucket createBucket() {
        Duration duration = Duration.parse("PT" + refillDuration.toUpperCase());
        return Bucket.builder()
                .addLimit(Bandwidth.classic(capacity, Refill.greedy(refillTokens, duration)))
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank() && !"unknown".equalsIgnoreCase(xff)) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitResponse(HttpServletResponse response, long waitSeconds) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setHeader("Retry-After", String.valueOf(waitSeconds));
        response.setHeader("X-RateLimit-Limit", String.valueOf(capacity));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", String.valueOf(Instant.now().plusSeconds(waitSeconds).getEpochSecond()));

        String json = String.format(
                "{\"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Try again in %d seconds.\"}",
                waitSeconds
        );
        response.getWriter().write(json);
    }
}