package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.ManufacturerPaymentProfileDto;
import projects.vendex.services.ManufacturerPaymentProfileService;

@RestController
@RequestMapping("demo/admin/manufacturers/{manufacturerId}/payment-profile")
// @PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ManufacturerPaymentProfileController {

    private final ManufacturerPaymentProfileService service;

    @PutMapping
    public ManufacturerPaymentProfileDto save(
            @PathVariable Long manufacturerId,
            @RequestBody ManufacturerPaymentProfileDto dto
    ) {
        return service.save(manufacturerId, dto);
    }

    @GetMapping
    public ManufacturerPaymentProfileDto get(@PathVariable Long manufacturerId) {
        return service.get(manufacturerId);
    }
}