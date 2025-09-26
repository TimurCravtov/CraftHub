package utm.server.modules.categories;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping("/")
    public CategoryEntity addCategory(@RequestBody CategoryDTO category){
        return categoryService.addCategory(category);
    }

    @GetMapping("/findall")
    public List<CategoryEntity> getAllCategories(){return categoryService.findAllCategories();}

    @GetMapping("{name}")
    public List<CategoryEntity> findCategoriesByName(@PathVariable String name){return categoryService.findAllCategoriesByName(name);}

}
