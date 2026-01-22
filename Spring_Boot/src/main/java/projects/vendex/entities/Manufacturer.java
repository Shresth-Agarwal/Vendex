package projects.vendex.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "manufacturers")
@Getter
@Setter
public class Manufacturer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String emailId;
    private String phone;
    private String location;
    private Double distanceKm;

    @OneToMany(mappedBy = "manufacturer", cascade = CascadeType.ALL)
    private List<ManufacturerProduct> products;

    @OneToOne(mappedBy = "manufacturer", cascade = CascadeType.ALL)
    private ManufacturerPaymentProfile paymentProfile;
}
