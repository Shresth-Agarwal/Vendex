package projects.vendex.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "manufacturer_ratings")
@Getter @Setter
public class ManufacturerRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rating;
    private String review;

    private LocalDateTime ratedAt;

    @ManyToOne
    private Manufacturer manufacturer;
}
