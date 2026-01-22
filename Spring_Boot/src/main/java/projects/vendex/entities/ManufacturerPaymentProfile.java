package projects.vendex.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import projects.vendex.enums.PaymentMode;

@Entity
@Table(name = "manufacturer_payment_profiles")
@Getter @Setter
public class ManufacturerPaymentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean advanceRequired;

    @Enumerated(EnumType.STRING)
    private PaymentMode preferredPaymentMode;

    @OneToOne
    @JoinColumn(name = "manufacturer_id")
    private Manufacturer manufacturer;
}
