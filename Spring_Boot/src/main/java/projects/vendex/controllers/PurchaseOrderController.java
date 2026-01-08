package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.entities.PurchaseOrder;
import projects.vendex.entities.Stock;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.PurchaseOrderRepository;
import projects.vendex.repositories.StockRepository;

import java.util.List;

@RestController
@RequestMapping("demo/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderRepository poRepository;
    private final StockRepository stockRepository;

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

        if (status.equals("APPROVED")) {
            Stock stock = stockRepository.findById(po.getSku()).orElseThrow(() -> new NotFoundException("Stock unavailable for this product"));
            stock.setOnHand(stock.getOnHand() + po.getQuantity());
            stockRepository.save(stock);
        }

        po.setStatus(status);
        return ResponseEntity.ok(poRepository.save(po));
    }
}
