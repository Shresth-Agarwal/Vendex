package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.vendex.entities.Shift;

import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByStatus(String status);
}
