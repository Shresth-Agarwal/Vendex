package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import projects.vendex.entities.Stock;

@Repository
public interface StockRepository
        extends JpaRepository<Stock, String> {}
