package utm.server.features.image.google_storage;

//import com.google.auth.oauth2.ServiceAccountCredentials;
//import com.google.cloud.storage.Storage;
//import com.google.cloud.storage.StorageOptions;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

//import java.io.FileInputStream;
//import java.io.IOException;

@Data
@Component
@ConfigurationProperties(prefix = "gcs")
public class BucketConfig {
    private String bucketName;

}
