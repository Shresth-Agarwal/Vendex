package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.ManufacturerRatingDto;
import projects.vendex.entities.ManufacturerRating;
import projects.vendex.services.ManufacturerRatingService;

import java.util.List;

@RestController
@RequestMapping("demo/admin/manufacturers/{manufacturerId}/ratings")
// @PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ManufacturerRatingController {

    private final ManufacturerRatingService service;

    @PostMapping
    public ManufacturerRatingDto create(
            @PathVariable Long manufacturerId,
            @RequestBody ManufacturerRatingDto dto
    ) {
        return service.create(manufacturerId, dto);
    }

    @GetMapping
    public List<ManufacturerRatingDto> getAll(
            @PathVariable Long manufacturerId
    ) {
        return service.getByManufacturer(manufacturerId);
    }
}