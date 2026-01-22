package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.ManufacturerDto;
import projects.vendex.entities.Manufacturer;
import projects.vendex.services.ManufacturerService;

import java.util.List;

@RestController
@RequestMapping("demo/admin/manufacturers")
//@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ManufacturerController {

    private final ManufacturerService service;

    @PostMapping
    public ManufacturerDto create(@RequestBody ManufacturerDto dto) {
        return service.create(dto);
    }

    @GetMapping("/{id}")
    public ManufacturerDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public List<ManufacturerDto> getAllManufacturers() {
        return service.getAllManufacturers();
    }

    @PutMapping("/{id}")
    public ManufacturerDto update(
            @PathVariable Long id,
            @RequestBody ManufacturerDto dto
    ) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}