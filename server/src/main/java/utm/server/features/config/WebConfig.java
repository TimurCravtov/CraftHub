package utm.server.features.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow requests from your frontend (React) on localhost:5173
        registry.addMapping("/**") // Enable CORS for all paths
                .allowedOrigins("http://localhost:5173") // Allow only your frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow these HTTP methods
                .allowedHeaders("Content-Type", "Authorization")
                .allowCredentials(true); // Allow credentials (cookies, etc.)
    }
}

