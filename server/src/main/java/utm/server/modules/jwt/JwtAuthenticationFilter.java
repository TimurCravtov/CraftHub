package utm.server.modules.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import utm.server.except.ErrorMessage;
import utm.server.modules.users.security.UserSecurityPrincipal;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String HEADER_NAME = "Authorization";

    private final JwtService jwtService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return "OPTIONS".equalsIgnoreCase(request.getMethod()) ||
               path.startsWith("/api/auth/signup") ||
               path.startsWith("/api/auth/signin") ||
               path.startsWith("/api/auth/login") ||
               path.startsWith("/api/auth/refresh");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            @NotNull HttpServletResponse response,
            @NotNull FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader(HEADER_NAME);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(BEARER_PREFIX.length());
        try {
            Claims claims = jwtService.validateToken(jwt);
            Long userId = Long.parseLong(claims.getSubject());

            List<?> rawRoles = claims.get("roles", List.class);
            List<String> rolesList = new ArrayList<>();
            if (rawRoles != null) {
                for (Object role : rawRoles) {
                    if (role instanceof String) {
                        rolesList.add((String) role);
                    }
                }
            }
            
            System.out.println("=== JWT Filter: User " + userId + " has roles in token: " + rolesList);
            
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            for (String role : rolesList) {
                authorities.add(new SimpleGrantedAuthority(role));
            }
            System.out.println("=== JWT Filter: Created authorities: " + authorities);

            UserSecurityPrincipal user = new UserSecurityPrincipal();
            user.setId(userId);

            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(user, null, authorities);
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            System.out.println("=== JWT Filter: Set authentication with authorities: " + authenticationToken.getAuthorities());

        } catch (Exception e) {

            ErrorMessage error = new ErrorMessage(403, "Invalid or expired token");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            new ObjectMapper().writeValue(response.getWriter(), error);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
