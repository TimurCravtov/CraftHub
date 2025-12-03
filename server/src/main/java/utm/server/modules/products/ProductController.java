package utm.server.modules.products;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import utm.server.except.ErrorMessage;
import utm.server.except.NoRightsException;
import utm.server.modules.image.ImageService;
import utm.server.modules.users.security.UserSecurityPrincipal;
import utm.server.modules.products.dto.ProductCreationDto;
import utm.server.modules.products.dto.ProductDto;

//import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ImageService imageService;

    @PostMapping("/")
    public ProductDto createProduct(@RequestBody ProductCreationDto product, @AuthenticationPrincipal UserSecurityPrincipal user) throws NoRightsException {

        return productService.addProduct(product, user);
    }

    @GetMapping("/findById/{id}")
    public ResponseEntity<?> findById(@PathVariable String id) {
        try {
            // Try parsing as UUID first
            java.util.UUID uuid = java.util.UUID.fromString(id);
            return productService.findByUuid(uuid)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(404)
                            .body(new ErrorMessage(HttpStatus.NOT_FOUND.value(), "Product with UUID not found")));
        } catch (IllegalArgumentException e) {
            // Fallback to Long ID for backward compatibility (optional, or remove if strict)
            try {
                Long longId = Long.parseLong(id);
                return productService.findById(longId)
                        .<ResponseEntity<?>>map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.status(404)
                                .body(new ErrorMessage(HttpStatus.NOT_FOUND.value(), "Product with Id not found")));
            } catch (NumberFormatException nfe) {
                 return ResponseEntity.status(400)
                        .body(new ErrorMessage(HttpStatus.BAD_REQUEST.value(), "Invalid ID format"));
            }
        }
    }

    @GetMapping("/findall")
    public List<ProductDto> getAllProducts(){
        return productService.findAllProducts();
    }

    @GetMapping("/{title}")
    public List<ProductDto> getProductsByTitle(@PathVariable String title){
        return productService.findProductsByTitle(title);
    }

    @GetMapping("/by-shop/{id}")
    public List<ProductDto> getProductsByShop(@PathVariable Long id){
        return productService.findProductsByShopId(id);
    }
}
