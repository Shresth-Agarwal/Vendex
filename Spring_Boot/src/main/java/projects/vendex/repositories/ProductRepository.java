package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import projects.vendex.entities.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {}


