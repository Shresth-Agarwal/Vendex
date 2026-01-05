package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.entities.SalesRecord;
import projects.vendex.repositories.SalesRepository;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("demo/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesRepository salesRepository;

    @PostMapping
    public ResponseEntity<SalesRecord> addSale(@RequestBody SalesRecord sale) {
        return ResponseEntity.ok(salesRepository.save(sale));
    }

    @GetMapping("/{sku}")
    public ResponseEntity<List<SalesRecord>> getSales(@PathVariable String sku) {
        return ResponseEntity.ok(
                salesRepository.findBySkuAndSaleDateAfter(
                        sku,
                        LocalDate.now().minusDays(30)
                )
        );
    }
}
