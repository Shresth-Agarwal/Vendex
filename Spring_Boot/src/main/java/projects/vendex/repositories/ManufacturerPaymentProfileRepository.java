package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.vendex.entities.ManufacturerPaymentProfile;

import java.util.Optional;

public interface ManufacturerPaymentProfileRepository
        extends JpaRepository<ManufacturerPaymentProfile, Long> {
    Optional<ManufacturerPaymentProfile> findByManufacturerId(Long manufacturerId);
}
