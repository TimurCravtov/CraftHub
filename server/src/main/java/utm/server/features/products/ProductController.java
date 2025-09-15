package utm.server.features.products;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import utm.server.except.NoRightsException;
import utm.server.features.image.ImageService;
import utm.server.features.image.dto.ImageUploadResponse;
import utm.server.features.products.dto.ProductCreationDto;
import utm.server.features.users.UserEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ImageService imageService;

    @PostMapping("/")
    public Product createProduct(@RequestBody ProductCreationDto product, @AuthenticationPrincipal UserEntity user) throws NoRightsException {

        return productService.addProduct(product, user);
    }

    @GetMapping("/findall")
    public List<Product> getAllProducts(){
        return productService.findAllProducts();
    }

    @GetMapping("/{title}")
    public List<Product> getProductsByTitle(@PathVariable String title){
        return productService.findProductsByTitle(title);
    }

    @GetMapping("/by-shop/{id}")
    public List<Product> getProductsByShop(@PathVariable Long id){
        return productService.findProductsByShopId(id);
    }

}
