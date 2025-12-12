package utm.server.modules.products;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Profile("runner")
public class TagsInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final TagRepository tagRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        List<String> availableTags = Arrays.asList(
            "Furniture", "Ceramics", "Textiles", "Jewelry", "Woodwork", 
            "Glass", "Leather", "Art", "Paper", "Stone", "Prints", 
            "Baskets", "Candles"
        );

        // Seed tags
        for (String tagName : availableTags) {
            if (tagRepository.findByName(tagName).isEmpty()) {
                tagRepository.save(TagEntity.builder().name(tagName).build());
            }
        }

        Random random = new Random();

        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            if (product.getTags() == null) {
                product.setTags(new java.util.ArrayList<>());
            }
            if (product.getTags().isEmpty()) {
                int numberOfTags = random.nextInt(3) + 1; // 1 to 3 tags
                for (int i = 0; i < numberOfTags; i++) {
                    String tagName = availableTags.get(random.nextInt(availableTags.size()));
                    TagEntity tagEntity = tagRepository.findByName(tagName).orElse(null);
                    if (tagEntity != null && !product.getTags().contains(tagEntity)) {
                        product.getTags().add(tagEntity);
                    }
                }
                productRepository.save(product);
            }
        }
    }
}
