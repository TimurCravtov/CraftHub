package utm.server.authentication.model;

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
    private UserEntity user;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret; // For TOTP

    @Column(name = "two_factor_enabled")
    private boolean twoFactorEnabled; // For TOTP

    @Column(name = "phone_number")
    private String phoneNumber; // For SMS 2FA

    @Column(name = "sms_two_factor_enabled")
    private boolean smsTwoFactorEnabled; // For SMS 2FA
}