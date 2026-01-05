package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.StockUpdateDto;
import projects.vendex.entities.Stock;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.StockRepository;

import java.time.LocalDate;

@RestController
@RequestMapping("demo/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockRepository stockRepository;

    @GetMapping("/{sku}")
    public ResponseEntity<Stock> getStock(@PathVariable String sku) {
        return ResponseEntity.ok(
                stockRepository.findById(sku)
                        .orElseThrow(() -> new IllegalArgumentException("Stock not found"))
        );
    }

    @PutMapping("/{sku}")
    public ResponseEntity<Stock> updateStock(
            @PathVariable String sku,
            @RequestBody StockUpdateDto dto
    ) {
        Stock stock = stockRepository.findById(sku)
                .orElseThrow(() -> new NotFoundException("Stock not found"));

        stock.setOnHand(dto.getOnHand());
        stock.setLastUpdated(LocalDate.now());

        return ResponseEntity.ok(stockRepository.save(stock));
    }
}
