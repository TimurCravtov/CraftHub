package utm.server.modules.billing;

import org.springframework.stereotype.Service;
import utm.server.modules.users.UserEntity;
import utm.server.modules.users.UserRepository;

import java.util.Optional;


@Service
public class BillingService {

    private final BillingRepository billingRepository;
    private final UserRepository userRepository;
    public BillingService(BillingRepository billingRepository, UserRepository userRepository) {
        this.billingRepository = billingRepository;
        this.userRepository = userRepository;
    }

   public void updateBillingInfo(Long userId, BillingDTO billingDTO){
        BillingEntity newBillingEntity = new BillingEntity();
        newBillingEntity.setCity(billingDTO.getCity());
        newBillingEntity.setAddress(billingDTO.getAddress());
        newBillingEntity.setLastName(billingDTO.getLastName());
        newBillingEntity.setPhoneNumber(billingDTO.getPhoneNumber());
        Optional<UserEntity> user = userRepository.findById(userId);
       UserEntity existingUser = user.orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        newBillingEntity.setUser(existingUser);
        billingRepository.save(newBillingEntity);

   }

}
