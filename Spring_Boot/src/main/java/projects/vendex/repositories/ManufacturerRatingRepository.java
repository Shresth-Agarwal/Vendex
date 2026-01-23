package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import projects.vendex.entities.ManufacturerRating;

import java.util.List;

public interface ManufacturerRatingRepository extends JpaRepository<ManufacturerRating, Long> {
    List<ManufacturerRating> findByManufacturerId(Long manufacturerId);

    @Query("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM ManufacturerRating r
        WHERE r.manufacturer.id = :manufacturerId
    """)
    double findAverageRating(@Param("manufacturerId") Long manufacturerId);
}