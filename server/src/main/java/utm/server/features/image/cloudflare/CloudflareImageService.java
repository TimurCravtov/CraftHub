package utm.server.features.image.cloudflare;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import utm.server.features.image.ImageService;

import java.io.IOException;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
@Primary
@RequiredArgsConstructor
public class CloudflareImageService implements ImageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${cloudflare.r2.bucket}")
    private String bucket;

    @Value("${cloudflare.r2.endpoint}")
    private String endpoint;

    /**
     * Uploads a file to Cloudflare R2.
     * @param file Multipart file
     * @param isPublic true if the file should be public
     * @return object key (can be used to generate signed URL for private files)
     */
    @SneakyThrows
    public String upload(MultipartFile file, boolean isPublic) {
        String original = Optional.ofNullable(file.getOriginalFilename())
                .orElseThrow(() -> new RuntimeException("Filename is missing"))
                .toLowerCase();

        String contentType = Optional.ofNullable(file.getContentType())
                .orElseThrow(() -> new RuntimeException("Content-Type is unknown"));

        // Determine folder based on file extension
        String ext = getFileExtension(original);
        String folder = switch (ext) {
            case "jpg","jpeg","png","gif" -> "images";
            case "mp4","mov"              -> "videos";
            case "pdf","doc","docx","txt" -> "documents";
            default -> throw new RuntimeException("Unsupported file type: " + contentType);
        };

        if (!isPublic) {
            folder = "private/" + folder; // private files in subfolder
        }

        String key = String.format("%s/%s-%s", folder, UUID.randomUUID(), original);

        // Upload to R2
        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        try {
            s3Client.putObject(req, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException e) {
            throw new FileUploadException("File upload to Cloudflare R2 failed", e);
        }

        return key;
    }

    /**
     * Generates a signed URL for a private image.
     */
    @Override
    public String getSignedLink(String imageId, Duration duration) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(imageId)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(duration)
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest)
                .url()
                .toString();
    }

    /**
     * Returns a permanent URL for public images.
     */
    @Override
    public String getPermanentLink(String imageId) {
        return String.format("%s/%s/%s", endpoint, bucket, imageId);
    }

    /**
     * Optional: delete object
     */
    @Override
    public boolean delete(String imageId) {
        try {
            s3Client.deleteObject(builder -> builder.bucket(bucket).key(imageId));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Optional: check if object exists
     */
    @Override
    public boolean exists(String imageId) {
        try {
            return s3Client.headObject(builder -> builder.bucket(bucket).key(imageId)) != null;
        } catch (Exception e) {
            return false;
        }
    }

    private String getFileExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length() - 1) {
            throw new IllegalArgumentException("Invalid file extension in filename: " + filename);
        }
        return filename.substring(idx + 1);
    }
}
