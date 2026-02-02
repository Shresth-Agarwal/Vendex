package projects.vendex.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import projects.vendex.dtos.PurchaseOrderDto;
import projects.vendex.entities.Manufacturer;
import projects.vendex.entities.PurchaseOrder;
import projects.vendex.entities.PurchaseOrderItem;
import projects.vendex.enums.PurchaseOrderStatus;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.mappers.PurchaseOrderMapper;
import projects.vendex.repositories.ManufacturerRepository;
import projects.vendex.repositories.PurchaseOrderRepository;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final StockService stockService;
    private final PurchaseOrderMapper purchaseOrderMapper;


    public PurchaseOrder getById(Long id) {
        return poRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Purchase order not found"));
    }

    public List<PurchaseOrderDto> getAllPurchaseOrders() {
        return poRepository.findAll()
                .stream()
                .map(purchaseOrderMapper::toDto)
                .toList();
    }

    @Transactional
    public PurchaseOrder createFromDecision(
            List<PurchaseOrderItem> items,
            Double confidence
    ) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Purchase order must contain at least one item");
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setStatus(PurchaseOrderStatus.PENDING_APPROVAL);
        po.setConfidence(confidence);
        po.setCreatedAt(LocalDateTime.now());

        // Attach items
        for (PurchaseOrderItem item : items) {
            item.setPurchaseOrder(po);
        }
        po.setItems(items);

        return poRepository.save(po);
    }

    @Transactional
    public PurchaseOrder approve(Long poId) {
        PurchaseOrder po = getById(poId);

        if (po.getStatus() != PurchaseOrderStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Purchase order is not pending approval");
        }

        po.setStatus(PurchaseOrderStatus.APPROVED);
        po.setApprovedAt(LocalDateTime.now());

        return poRepository.save(po);
    }

    @Transactional
    public PurchaseOrder finalizeManufacturer(Long poId, Long manufacturerId) {
        PurchaseOrder po = getById(poId);

        if (po.getStatus() != PurchaseOrderStatus.APPROVED
                && po.getStatus() != PurchaseOrderStatus.AI_DOCUMENTS_READY) {
            throw new IllegalStateException("Purchase order is not ready for manufacturer finalization");
        }

        Manufacturer manufacturer = manufacturerRepository.findById(manufacturerId)
                .orElseThrow(() -> new NotFoundException("Manufacturer not found"));

        po.setManufacturer(manufacturer);
        po.setStatus(PurchaseOrderStatus.READY_TO_SEND);

        return poRepository.save(po);
    }

    @Transactional
    public PurchaseOrder markSent(Long poId) {
        PurchaseOrder po = getById(poId);

        if (po.getStatus() != PurchaseOrderStatus.READY_TO_SEND) {
            throw new IllegalStateException("Purchase order is not ready to be sent");
        }

        po.setStatus(PurchaseOrderStatus.SENT_TO_MANUFACTURER);
        po.setSentAt(LocalDateTime.now());

        return poRepository.save(po);
    }

    @Transactional
    public PurchaseOrder markReceived(Long poId) {
        PurchaseOrder po = getById(poId);

        if (po.getStatus() != PurchaseOrderStatus.SENT_TO_MANUFACTURER) {
            throw new IllegalStateException("Purchase order has not been sent yet");
        }

        // Update stock per item
        for (PurchaseOrderItem item : po.getItems()) {
            stockService.addStock(
                    item.getSku(),
                    item.getQuantity()
            );
        }

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setReceivedAt(LocalDateTime.now());

        return poRepository.save(po);
    }

    @Transactional
    public void delete(Long poId) {
        PurchaseOrder po = getById(poId);

        // Only allow deletion when still pending approval
        if (po.getStatus() != PurchaseOrderStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only pending purchase orders can be deleted");
        }

        poRepository.delete(po);
    }
}
