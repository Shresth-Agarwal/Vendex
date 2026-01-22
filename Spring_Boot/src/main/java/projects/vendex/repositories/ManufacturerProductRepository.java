package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.vendex.entities.ManufacturerProduct;

import java.util.List;

public interface ManufacturerProductRepository extends JpaRepository<ManufacturerProduct, Long> {
    List<ManufacturerProduct> findByManufacturerId(Long manufacturerId);
}