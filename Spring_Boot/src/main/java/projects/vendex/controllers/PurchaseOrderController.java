package projects.vendex.controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import projects.vendex.dtos.PurchaseOrderDto;
import projects.vendex.entities.PurchaseOrderItem;
import projects.vendex.mappers.PurchaseOrderMapper;
import projects.vendex.services.PurchaseOrderService;
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

    // Create PO (accepts PurchaseOrderDto with items and optional confidence)
    @PostMapping
    public PurchaseOrderDto create(@RequestBody PurchaseOrderDto dto) {
        List<PurchaseOrderItem> items = dto.getItems() == null ? List.of() : dto.getItems()
                .stream()
                .map(i -> {
                    PurchaseOrderItem it = new PurchaseOrderItem();
                    it.setSku(i.getSku());
                    it.setQuantity(i.getQuantity());
                    return it;
                })
                .collect(Collectors.toList());

        Double confidence = dto.getConfidence() == null ? 0.0 : dto.getConfidence();

        return mapper.toDto(service.createFromDecision(items, confidence));
    }

    // Delete PO
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
