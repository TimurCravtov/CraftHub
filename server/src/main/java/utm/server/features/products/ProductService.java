package utm.server.features.products;

import org.springframework.stereotype.Service;

//import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAllProducts(){return productRepository.findAll();}

    public List<Product> findProductsByTitle(String title){return productRepository.findByTitle(title);}

    public Product addProduct(Product product){
        productRepository.save(product);
        return product;
    }
}
