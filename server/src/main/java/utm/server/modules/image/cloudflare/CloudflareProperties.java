package utm.server.modules.image.cloudflare;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "cloudflare.r2")
public class CloudflareProperties {
    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucket;
}