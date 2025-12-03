package utm.server.modules.shops;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import utm.server.modules.products.ProductService;
import utm.server.modules.products.dto.ProductDto;
import utm.server.modules.shops.dto.ShopCreationRequestDTO;
import utm.server.modules.shops.dto.ShopDto;
import utm.server.modules.shops.dto.ShopMapper;
import utm.server.modules.users.security.UserSecurityPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final ShopService shopService;
    private final ProductService productService;
    private final ShopMapper shopMapper;

    @Autowired
    public ShopController(ShopService shopService, ProductService productService, ShopMapper shopMapper) {
        this.shopService = shopService;
        this.productService = productService;
        this.shopMapper = shopMapper;
    }

    @PostMapping("/addshop")
    public ShopDto addShop(@RequestBody ShopCreationRequestDTO shopRequest,
                           @AuthenticationPrincipal UserSecurityPrincipal user) {
        return shopMapper.toDto(shopService.addShop(shopRequest, user));
    }

    @GetMapping("/")
    public List<ShopDto> getAllShops() {
        return shopService.getAllShops()
                .stream()
                .map(shopMapper::toDto)
                .toList();
    }

    @GetMapping("/name")
    public List<ShopDto> getShopsByName(@RequestParam String name) {
        return shopService.getShopsByName(name)
                .stream()
                .map(shopMapper::toDto)
                .toList();
    }

    @GetMapping("/{shopId}")
    public ShopDto getShopById(@PathVariable String shopId) {
        try {
            java.util.UUID uuid = java.util.UUID.fromString(shopId);
            return shopMapper.toDto(shopService.getShopByUuid(uuid));
        } catch (IllegalArgumentException e) {
             try {
                Long id = Long.parseLong(shopId);
                return shopMapper.toDto(shopService.getShopById(id));
            } catch (NumberFormatException nfe) {
                throw new RuntimeException("Invalid Shop ID format");
            }
        }
    }

    @GetMapping("/{shopId}/products")
    public List<ProductDto> getProductsByShop(@PathVariable String shopId) {
         try {
            java.util.UUID uuid = java.util.UUID.fromString(shopId);
            return productService.findProductsByShopUuid(uuid);
        } catch (IllegalArgumentException e) {
             try {
                Long id = Long.parseLong(shopId);
                return productService.findProductsByShopId(id);
            } catch (NumberFormatException nfe) {
                throw new RuntimeException("Invalid Shop ID format");
            }
        }
    }
}
