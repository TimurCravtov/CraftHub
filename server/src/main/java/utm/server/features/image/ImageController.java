package utm.server.features.image;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Tag(name = "Images", description = "Endpoints for uploading and retrieving images")
public class ImageController {

    private final ImageService imageService;

    @Operation(summary = "Upload image", description = "Upload an image to storage (private/public based on flag)")
    @PostMapping("/upload")
    public ResponseEntity<String> upload(
            @Parameter(description = "File to upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Whether the file should be public") @RequestParam("isPublic") boolean isPublic
    ) {
        String link = imageService.upload(file, isPublic);
        return ResponseEntity.ok(link);
    }

    @Operation(summary = "Upload public image", description = "Upload to public storage and get a permanent direct usable link")
    @PostMapping("/upload_public")
    public ResponseEntity<String> uploadPublic(
            @Parameter(name="File", description = "File to upload") @RequestParam("file") MultipartFile file
    ) {
        String link = imageService.uploadPublicAndGetPermanentLink(file);
        return ResponseEntity.ok(link);
    }

    @Operation(summary = "Get signed URL", description = "Get a temporary signed URL for an image")
    @GetMapping("/getsignedurl")
    public ResponseEntity<String> getSignedLink(
            @Parameter(description = "ID of the image") @RequestParam("imageId") String link
    ) {
        String signedUrl = imageService.getSignedLink(link, ImageService.standardLinkDuration);
        return ResponseEntity.ok(signedUrl);
    }

    @Operation(summary = "Get permanent URL", description = "Get a permanent link for a public image")
    @GetMapping("/getpermanenturl")
    public ResponseEntity<String> getPermanentUrl(
            @Parameter(description = "ID of the image") @RequestParam("imageId") String link
    ) {
        String signedUrl = imageService.getPermanentLink(link);
        return ResponseEntity.ok(signedUrl);
    }

}
