package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.vendex.entities.Manufacturer;

public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {}
