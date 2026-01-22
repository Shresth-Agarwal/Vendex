package projects.vendex.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "manufacturer_products")
@Getter
@Setter
public class ManufacturerProduct {

    @Id
    @GeneratedValue(strategy =
            GenerationType.IDENTITY)
    private Long id;

    private String brand;
    private String category;
    private String productName;

    private Integer minimumOrderQuantity;
    private Double costPrice;

    @ManyToOne
    @JoinColumn(name = "manufacturer_id")
    private Manufacturer manufacturer;
}
