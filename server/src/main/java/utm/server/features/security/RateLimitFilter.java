package utm.server.features.security;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
@Order(1)
public class RateLimitFilter implements Filter {

    private final ConcurrentHashMap<String, AtomicLong> requestCount = new ConcurrentHashMap<>();
    private final long rateLimit = 10;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        String ipAddress = request.getRemoteAddr();
        AtomicLong count = requestCount.computeIfAbsent(ipAddress, k -> new AtomicLong());

        if (count.incrementAndGet() > rateLimit) {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(429);
            httpResponse.getWriter().write("Rate limit exceeded. Please try again later.");
            return;
        }

        chain.doFilter(request, response);
    }

}