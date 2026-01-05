package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.ProductRequestDto;
import projects.vendex.entities.Product;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.ProductRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product create(ProductRequestDto dto) {
        Product product = Product.builder()
                .sku(dto.getSku())
                .productName(dto.getProductName())
                .unitCost(dto.getUnitCost())
                .active(dto.isActive())
                .build();

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
