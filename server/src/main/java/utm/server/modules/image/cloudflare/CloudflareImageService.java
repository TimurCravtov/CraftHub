package utm.server.modules.image.cloudflare;

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
import utm.server.modules.image.ImageService;
import utm.server.modules.image.dto.ImageUploadResponse;

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

    @SneakyThrows
    public ImageUploadResponse upload(MultipartFile file, boolean isPublic, boolean isTemp) {
        // Validate file
        String originalFilename = Optional.ofNullable(file.getOriginalFilename())
                .orElseThrow(() -> new RuntimeException("Filename is missing"))
                .toLowerCase();
        String contentType = Optional.ofNullable(file.getContentType())
                .orElseThrow(() -> new RuntimeException("Content-Type is unknown"));
        String ext = getFileExtension(originalFilename);

        // Determine folder
        String folder = isTemp ? "temp" : determineFolder(ext, isPublic);

        // Generate object key
        String key = String.format("%s/%s.%s", folder, UUID.randomUUID(), ext);

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

        // Return response with key and URL (for public, non-temporary files)
        String url = (isPublic) ? getSignedLink(key, Duration.ofDays(7)) : null;
        return new ImageUploadResponse(key, url);
    }

    @SneakyThrows
    public ImageUploadResponse confirmUpload(String tempObjectKey) {
        if (!tempObjectKey.startsWith("temp/")) {
            throw new IllegalArgumentException("Key does not belong to temp storage: " + tempObjectKey);
        }

        // Extract file extension
        String ext = getFileExtension(tempObjectKey);

        // Determine permanent folder (assume public by default, as isPublic is not provided)
        String folder = determineFolder(ext, true);
        String newKey = String.format("%s/%s.%s", folder, UUID.randomUUID(), ext);

        // Copy from temp to permanent
        s3Client.copyObject(builder -> builder
                .sourceBucket(bucket)
                .sourceKey(tempObjectKey)
                .destinationBucket(bucket)
                .destinationKey(newKey));

        // Delete temp object
        s3Client.deleteObject(builder -> builder.bucket(bucket).key(tempObjectKey));

        // Return response with new key and permanent URL
        return new ImageUploadResponse(newKey, getPermanentLink(newKey));
    }

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

    @Override
    public String getPermanentLink(String imageId) {
//        return String.format("%s/%s/%s", endpoint, bucket, imageId);
        return getSignedLink(imageId, Duration.ofDays(7));
    }

    @Override
    public boolean delete(String imageId) {
        try {
            s3Client.deleteObject(builder -> builder.bucket(bucket).key(imageId));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

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

    private String determineFolder(String ext, boolean isPublic) {
        String folder = switch (ext) {
            case "jpg", "jpeg", "png", "gif" -> "images";
            case "mp4", "mov" -> "videos";
            case "pdf", "doc", "docx", "txt" -> "documents";
            default -> throw new RuntimeException("Unsupported file type: " + ext);
        };
        return isPublic ? folder : "private/" + folder;
    }
}
