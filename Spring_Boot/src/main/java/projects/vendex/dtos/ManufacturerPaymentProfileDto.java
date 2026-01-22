package projects.vendex.dtos;

import lombok.Data;
import projects.vendex.enums.PaymentMode;

@Data
public class ManufacturerPaymentProfileDto {
    private Boolean advanceRequired;
    private PaymentMode preferredPaymentMode;
}
