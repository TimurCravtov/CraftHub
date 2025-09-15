package utm.server.authentication.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import utm.server.features.users.UserEntity;

@Entity
@Table(name = "two_factor_data")
@Data
public class TwoFactorData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonBackReference // prevenim recursivitatea JSON
    private UserEntity user;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret; // pentru TOTP

    @Column(name = "two_factor_enabled")
    private boolean twoFactorEnabled; // pentru TOTP
}
