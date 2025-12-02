package utm.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${client.base.url}")
    private String clientBaseUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS is handled in SecurityConfig
        // registry.addMapping("/**")
        //         .allowedOriginPatterns(clientBaseUrl, "https://localhost:*", "http://localhost:*")
        //         .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        //         .allowedHeaders("*")
        //         .exposedHeaders("Authorization")
        //         .allowCredentials(true)
        //         .maxAge(3600);
    }
}
