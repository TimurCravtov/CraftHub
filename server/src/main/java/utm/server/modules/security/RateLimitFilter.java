package utm.server.modules.security;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

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

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private final LoadingCache<String, Bucket> cache;
    private final RequestMappingHandlerMapping handlerMapping;
    private final Map<String, RateLimitConfig> endpointConfigs = new ConcurrentHashMap<>();

    @Value("${rate-limit.capacity:50}")
    private long defaultCapacity;

    @Value("${rate-limit.refill-tokens:20}")
    private long defaultRefillTokens;

    @Value("${rate-limit.refill-duration:PT1M}")
    private String defaultRefillDuration;

    @Value("${rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    public RateLimitFilter(RequestMappingHandlerMapping handlerMapping) {
        this.handlerMapping = handlerMapping;
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .maximumSize(10_000)
                .build(key -> createDefaultBucket());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain filterChain) throws jakarta.servlet.ServletException, IOException {
        if (!rateLimitEnabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String endpoint = request.getRequestURI() + "::" + request.getMethod();
        
        // Get rate limit config for this endpoint
        RateLimitConfig config = getRateLimitConfig(request);
        
        // Create cache key combining IP and endpoint (for per-endpoint limits)
        String cacheKey = clientIp + "::" + config.getKey();
        
        var bucket = cache.get(cacheKey, key -> createBucket(config));

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Limit", String.valueOf(config.getCapacity()));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            response.setHeader("X-RateLimit-Reset", String.valueOf(Instant.now().plus(config.getDuration()).getEpochSecond()));
            filterChain.doFilter(request, response);
        } else {
            long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            sendRateLimitResponse(response, config, waitSeconds);
        }
    }

    /**
     * Get rate limit configuration for the current request
     */
    private RateLimitConfig getRateLimitConfig(HttpServletRequest request) {
        try {
            HandlerMethod handlerMethod = (HandlerMethod) handlerMapping.getHandler(request).getHandler();
            RateLimit annotation = handlerMethod.getMethodAnnotation(RateLimit.class);
            
            if (annotation != null) {
                String key = annotation.key().isEmpty() 
                    ? request.getRequestURI() 
                    : annotation.key();
                return new RateLimitConfig(
                    annotation.capacity(),
                    annotation.refillTokens(),
                    annotation.refillDuration(),
                    key
                );
            }
        } catch (Exception e) {
            // If handler resolution fails, use default config
        }
        
        return new RateLimitConfig(
            defaultCapacity,
            defaultRefillTokens,
            defaultRefillDuration,
            "default"
        );
    }

    private Bucket createBucket(RateLimitConfig config) {
        Duration duration = Duration.parse(config.getRefillDuration());
        return Bucket.builder()
                .addLimit(Bandwidth.classic(config.getCapacity(), Refill.greedy(config.getRefillTokens(), duration)))
                .build();
    }

    private Bucket createDefaultBucket() {
        Duration duration = Duration.parse(defaultRefillDuration);
        return Bucket.builder()
                .addLimit(Bandwidth.classic(defaultCapacity, Refill.greedy(defaultRefillTokens, duration)))
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank() && !"unknown".equalsIgnoreCase(xff)) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitResponse(HttpServletResponse response, RateLimitConfig config, long waitSeconds) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setHeader("Retry-After", String.valueOf(waitSeconds));
        response.setHeader("X-RateLimit-Limit", String.valueOf(config.getCapacity()));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", String.valueOf(Instant.now().plusSeconds(waitSeconds).getEpochSecond()));

        String json = String.format(
                "{\"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Try again in %d seconds.\"}",
                waitSeconds
        );
        response.getWriter().write(json);
    }
}