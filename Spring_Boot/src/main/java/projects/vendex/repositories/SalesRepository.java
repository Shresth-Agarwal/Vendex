package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import projects.vendex.entities.SalesRecord;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesRepository
        extends JpaRepository<SalesRecord, Long> {

    List<SalesRecord> findBySkuAndSaleDateAfter(
            String sku,
            LocalDate fromDate
    );
}
