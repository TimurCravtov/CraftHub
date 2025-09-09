package utm.server.features.image;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file, @RequestParam("isPublic") boolean isPublic) {
        String link = imageService.upload(file, isPublic);
        return ResponseEntity.ok(link);
    }

    @GetMapping("/getsignedurl")
    public ResponseEntity<String> getSignedLink(@RequestParam("imageId") String link) {
        String signedUrl = imageService.getSignedLink(link, ImageService.standardLinkDuration);
        return ResponseEntity.ok(signedUrl);
    }

    @GetMapping("/getpermanenturl")
    public ResponseEntity<String> getPermanentUrl(@RequestParam("imageId") String link) {
        String signedUrl = imageService.getPermanentLink(link);
        return ResponseEntity.ok(signedUrl);
    }

}
