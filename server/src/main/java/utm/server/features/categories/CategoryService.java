package utm.server.features.categories;


import org.springframework.stereotype.Service;
import utm.server.features.products.Product;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public CategoryEntity addCategory(CategoryDTO category){
        CategoryEntity categoryEntity = new CategoryEntity();
        categoryEntity.setName(category.getName());
        categoryEntity.setDescription(category.getDescription());
        categoryRepository.save(categoryEntity);
        return categoryEntity;}
    public List<CategoryEntity> findAllCategories(){return categoryRepository.findAll();}

    public List<CategoryEntity> findAllCategoriesByName(String name){return categoryRepository.findAllByName(name);}





}
