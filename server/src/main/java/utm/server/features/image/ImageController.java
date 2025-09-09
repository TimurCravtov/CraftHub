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
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        String link = imageService.upload(file);
        return ResponseEntity.ok(link);
    }

    @GetMapping("/getsignedurl")
    public ResponseEntity<String> getSignedLink(@RequestParam("imageId") String link) {
        String signedUrl = imageService.getSignedLink(link, ImageService.standardLinkDuration);
        return ResponseEntity.ok(signedUrl);
    }

}
