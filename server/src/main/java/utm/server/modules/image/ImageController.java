package utm.server.modules.image;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import utm.server.modules.image.dto.ImageUploadResponse;

import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Tag(name = "Images", description = "Endpoints for uploading and retrieving images")
public class ImageController {

    private final ImageService imageService;

    /**
     *
     * @param file File to uploads
     * @param isPublic Weather the image is public or private
     * @param isTemp Whether the image is temp or public
     * @return Either Link or Object Key
     */
    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponse> awesomeUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("isPublic") boolean isPublic,
            @RequestParam("isTemp") boolean isTemp
    ) {

        return ResponseEntity.ok(imageService.upload(file, isPublic, isTemp));
    }

    @PostMapping("/confirm_uploads")
    public ResponseEntity<List<ImageUploadResponse>> confirmUploads(
            @RequestParam("tempObjectKeys") List<String> tempObjectKeys
    ) {
        List<ImageUploadResponse> updImages = tempObjectKeys.stream().map(imageService::confirmUpload).toList();
        return new ResponseEntity<>(updImages, HttpStatus.OK);
    }
}
