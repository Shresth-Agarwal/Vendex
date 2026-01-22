package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.vendex.entities.ManufacturerRating;

import java.util.List;

public interface ManufacturerRatingRepository extends JpaRepository<ManufacturerRating, Long> {
    List<ManufacturerRating> findByManufacturerId(Long manufacturerId);
}