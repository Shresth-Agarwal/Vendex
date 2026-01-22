package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.PurchaseOrderDto;
import projects.vendex.mappers.PurchaseOrderMapper;
import projects.vendex.services.PurchaseOrderService;

import java.util.List;
@RestController
@RequestMapping("demo/manager/purchase-orders")
// @PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService service;
    private final PurchaseOrderMapper mapper;

    // Get PO by id
    @GetMapping("/{id}")
    public PurchaseOrderDto get(@PathVariable Long id) {
        return mapper.toDto(service.getById(id));
    }

    @GetMapping
    public List<PurchaseOrderDto> getAllPurchaseOrders() {
        return service.getAllPurchaseOrders();
    }

    // Approve PO
    @PutMapping("/{id}/approve")
    public PurchaseOrderDto approve(@PathVariable Long id) {
        return mapper.toDto(service.approve(id));
    }

    // Finalize manufacturer
    @PutMapping("/{id}/finalize/{manufacturerId}")
    public PurchaseOrderDto finalizeManufacturer(
            @PathVariable Long id,
            @PathVariable Long manufacturerId
    ) {
        return mapper.toDto(service.finalizeManufacturer(id, manufacturerId));
    }

    // Mark sent to manufacturer
    @PutMapping("/{id}/send")
    public PurchaseOrderDto markSent(@PathVariable Long id) {
        return mapper.toDto(service.markSent(id));
    }

    // Mark received (stock update happens in service)
    @PutMapping("/{id}/received")
    public PurchaseOrderDto markReceived(@PathVariable Long id) {
        return mapper.toDto(service.markReceived(id));
    }
}
