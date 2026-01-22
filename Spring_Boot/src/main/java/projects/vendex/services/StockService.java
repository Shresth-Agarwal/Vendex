package projects.vendex.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.entities.Stock;
import projects.vendex.repositories.StockRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;

    public int getOnHand(String sku) {
        return stockRepository.findById(sku)
                .map(Stock::getOnHand)
                .orElse(0);
    }

    @Transactional
    public void addStock(String sku, int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        Stock stock = stockRepository.findById(sku)
                .orElseGet(() -> Stock.builder()
                        .sku(sku)
                        .onHand(0)
                        .lastUpdated(LocalDate.now())
                        .build()
                );

        stock.setOnHand(stock.getOnHand() + quantity);
        stock.setLastUpdated(LocalDate.now());

        stockRepository.save(stock);
    }

    @Transactional
    public void reduceStock(String sku, int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        Stock stock = stockRepository.findById(sku)
                .orElseThrow(() ->
                        new IllegalStateException("Stock not found for SKU: " + sku)
                );

        if (stock.getOnHand() < quantity) {
            throw new IllegalStateException(
                    "Insufficient stock for SKU: " + sku
            );
        }

        stock.setOnHand(stock.getOnHand() - quantity);
        stock.setLastUpdated(LocalDate.now());

        stockRepository.save(stock);
    }
}
