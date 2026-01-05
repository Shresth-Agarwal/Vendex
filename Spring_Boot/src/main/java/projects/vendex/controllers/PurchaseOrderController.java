package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.entities.PurchaseOrder;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.PurchaseOrderRepository;

import java.util.List;

@RestController
@RequestMapping("demo/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderRepository poRepository;

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAll() {
        return ResponseEntity.ok(poRepository.findAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PurchaseOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("PO not found"));

        po.setStatus(status);
        return ResponseEntity.ok(poRepository.save(po));
    }
}
