package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.entities.SalesRecord;
import projects.vendex.entities.Stock;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.SalesRepository;
import projects.vendex.repositories.StockRepository;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("demo/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesRepository salesRepository;
    private final StockRepository stockRepository;

    @PostMapping
    public ResponseEntity<SalesRecord> addSale(@RequestBody SalesRecord sale) {
        Stock stock = stockRepository.findById(sale.getSku()).orElseThrow(() -> new NotFoundException("Stock unavailable"));

        if (stock.getOnHand() < sale.getQuantitySold()) throw new IllegalArgumentException("Low Stock. Unable to process request");
        stock.setOnHand(stock.getOnHand() - sale.getQuantitySold());

        stockRepository.save(stock);
        return ResponseEntity.ok(salesRepository.save(sale));
    }

    @GetMapping("/{sku}")
    public ResponseEntity<List<SalesRecord>> getSales(@PathVariable String sku) {
        return ResponseEntity.ok(
                salesRepository.findBySkuAndSaleDateAfter(
                        sku,
                        LocalDate.now().minusDays(7)
                )
        );
    }
}
