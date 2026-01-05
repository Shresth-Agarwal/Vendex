package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.ProductRequestDto;
import projects.vendex.entities.Product;
import projects.vendex.services.ProductService;

import java.util.List;

@RestController
@RequestMapping("demo/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody ProductRequestDto dto) {
        return ResponseEntity.ok(productService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @PutMapping("/{sku}")
    public ResponseEntity<Product> update(
            @PathVariable String sku,
            @RequestBody ProductRequestDto dto
    ) {
        return ResponseEntity.ok(productService.update(sku, dto));
    }

    @DeleteMapping("/{sku}")
    public ResponseEntity<Void> delete(@PathVariable String sku) {
        productService.delete(sku);
        return ResponseEntity.noContent().build();
    }
}
