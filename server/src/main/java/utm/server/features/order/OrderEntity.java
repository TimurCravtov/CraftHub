package utm.server.features.order;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.features.users.UserEntity;

import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private double total;
    @Column
    private Status status;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private UserEntity user;
    @JsonProperty("user_id")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }


}
