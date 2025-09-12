package utm.server.features.order;



import lombok.Data;


@Data
public class OrderDTO {
    private Long id;
    private double total;
    private Status status;
    private Long userId;

}
