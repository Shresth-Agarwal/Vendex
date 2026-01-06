package projects.vendex.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.ProductRequestDto;
import projects.vendex.entities.Product;
import projects.vendex.entities.Stock;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.ProductRepository;
import projects.vendex.repositories.StockRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    @Transactional
    public Product create(ProductRequestDto dto) {
        Product product = Product.builder()
                .sku(dto.getSku())
                .productName(dto.getProductName())
                .unitCost(dto.getUnitCost())
                .active(dto.isActive())
                .build();

        Stock stock = Stock.builder()
                .sku(dto.getSku())
                .onHand(dto.getInitialStock())
                .lastUpdated(LocalDate.now())
                .build();

        stockRepository.save(stock);
        return productRepository.save(product);
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product update(String sku, ProductRequestDto dto) {
        Product product = productRepository.findById(sku)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.setProductName(dto.getProductName());
        product.setUnitCost(dto.getUnitCost());
        product.setActive(dto.isActive());

        return productRepository.save(product);
    }

    public void delete(String sku) {
        productRepository.deleteById(sku);
    }
}
