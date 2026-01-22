package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.ManufacturerProductDto;
import projects.vendex.services.ManufacturerProductService;

import java.util.List;

@RestController
@RequestMapping("demo/admin/manufacturers/{manufacturerId}/products")
//@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ManufacturerProductController {

    private final ManufacturerProductService service;

    @PostMapping
    public ManufacturerProductDto create(
            @PathVariable Long manufacturerId,
            @RequestBody ManufacturerProductDto dto
    ) {
        return service.create(manufacturerId, dto);
    }

    @GetMapping
    public List<ManufacturerProductDto> getAll(
            @PathVariable Long manufacturerId
    ) {
        return service.getByManufacturer(manufacturerId);
    }

    @PutMapping("/{productId}")
    public ManufacturerProductDto update(
            @PathVariable Long productId,
            @RequestBody ManufacturerProductDto dto
    ) {
        return service.update(productId, dto);
    }

    @DeleteMapping("/{productId}")
    public void delete(@PathVariable Long productId) {
        service.delete(productId);
    }
}