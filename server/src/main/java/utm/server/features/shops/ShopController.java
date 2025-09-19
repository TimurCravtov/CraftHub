package utm.server.features.shops;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import utm.server.features.products.Product;
import utm.server.features.products.ProductService;
import utm.server.features.products.dto.ProductDto;
import utm.server.features.shops.dto.ShopCreationRequestDTO;
import utm.server.features.users.UserEntity;
import utm.server.features.users.security.UserSecurityPrincipal;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final ShopService shopService;
    private final ProductService productService;

    @Autowired
    public ShopController(ShopService shopService, ProductService productService) {
        this.shopService = shopService;
        this.productService = productService;
    }

    @PostMapping("/addshop")
    public ShopEntity addShop(@RequestBody ShopCreationRequestDTO shopRequest, @AuthenticationPrincipal UserSecurityPrincipal user) {
        return shopService.addShop(shopRequest, user);
    }

    @GetMapping("/")
    public ArrayList<ShopEntity> getAllShops(){
        return shopService.getAllShops();
    }

    @GetMapping("/name")
    public ArrayList<ShopEntity> getShopsByName(@RequestParam String name) {
        return shopService.getShopsByName(name);
    }

    @GetMapping("/{shopId}")
    public ShopEntity getShopById(@PathVariable Long shopId){
        return shopService.getShopById(shopId);
    }

    @GetMapping("/{shopId}/products")
    public List<ProductDto> getProductsByShop(@PathVariable Long shopId) {
        return productService.findProductsByShopId(shopId);
    }
}
