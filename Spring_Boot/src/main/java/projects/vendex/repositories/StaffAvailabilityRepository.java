package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.vendex.entities.StaffAvailability;

import java.util.List;

public interface StaffAvailabilityRepository
        extends JpaRepository<StaffAvailability, Long> {

    List<StaffAvailability> findByStaffId(Long staffId);
}
