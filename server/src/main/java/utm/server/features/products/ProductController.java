package utm.server.features.products;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

//import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/")
    public Product createProduct(@RequestBody Product product){
        return productService.addProduct(product);
    }

    @GetMapping("/findall")
    public List<Product> getAllProducts(){
        return productService.findAllProducts();
    }

    @GetMapping("/{title}")
    public List<Product> getProductsByTitle(@PathVariable String title){
        return productService.findProductsByTitle(title);
    }

}
