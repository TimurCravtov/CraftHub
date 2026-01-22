package utm.server.modules.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation for defining rate limit constraints on specific endpoints
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    
    /**
     * Maximum number of tokens (requests) allowed
     */
    long capacity() default 50;
    
    /**
     * Number of tokens to refill per duration period
     */
    long refillTokens() default 20;
    
    /**
     * Duration for refill in ISO-8601 format (e.g., "PT1M", "PT30S")
     */
    String refillDuration() default "PT1M";
    
    /**
     * Optional key to group rate limits (e.g., by user role, endpoint pattern)
     */
    String key() default "";
}
