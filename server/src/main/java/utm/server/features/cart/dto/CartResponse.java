package utm.server.features.cart.dto;

import java.util.List;

public class CartResponse {
    private Long cartId;
    private List<utm.server.features.cart.dto.CartItemResponse> items;

    // Getters and setters
    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public List<utm.server.features.cart.dto.CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<utm.server.features.cart.dto.CartItemResponse> items) {
        this.items = items;
    }
}