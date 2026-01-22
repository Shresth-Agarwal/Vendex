package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import projects.vendex.entities.PurchaseOrder;
import projects.vendex.enums.PurchaseOrderStatus;

@Repository
public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Long> {

    boolean existsByStatus(PurchaseOrderStatus status);
}

