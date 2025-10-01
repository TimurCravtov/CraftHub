package utm.server.modules.order;

import lombok.Data;

@Data
public class OrderDTO {
    private Long id;
    private double total;
    private Status status;
    private Long userId;
}
