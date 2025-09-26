package utm.server.modules.billing;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing")
public class BillingController {
    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }


    @PostMapping("/{id}")
    public ResponseEntity<?> updateBillingInfo(
            @PathVariable Long id,
            @RequestBody @Valid BillingDTO billingDTO
    ){
        billingService.updateBillingInfo(id, billingDTO);
        return ResponseEntity.ok("Billing info updated successfully");
    }
}
