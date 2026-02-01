package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.ReceiptRequestDto;
import projects.vendex.dtos.SourcingRequestDto;
import projects.vendex.entities.Manufacturer;
import projects.vendex.entities.ManufacturerPaymentProfile;
import projects.vendex.entities.PurchaseOrder;
import projects.vendex.enums.PaymentMode;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderAiPayloadService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final ManufacturerProductRepository manufacturerProductRepository;
    private final ManufacturerRatingRepository manufacturerRatingRepository;
    private final ManufacturerPaymentProfileRepository paymentProfileRepository;

    public ReceiptRequestDto buildReceiptPayload(PurchaseOrder po) {

        ReceiptRequestDto dto = new ReceiptRequestDto();

        ReceiptRequestDto.PurchaseOrderBlock poBlock = new ReceiptRequestDto.PurchaseOrderBlock();
        poBlock.setPurchaseOrderId(po.getId());
        poBlock.setCreatedAt(po.getCreatedAt() != null ? po.getCreatedAt().toString() : "");
        poBlock.setApprovedAt(po.getApprovedAt() != null ? po.getApprovedAt().toString() : "");

        dto.setPurchaseOrder(poBlock);

        Manufacturer m = po.getManufacturer();
        if (m == null) {
            throw new NotFoundException("Manufacturer not found for purchase order: " + po.getId());
        }
        
        ManufacturerPaymentProfile payment = paymentProfileRepository.findByManufacturerId(m.getId())
                .orElseThrow(() -> new NotFoundException("Manufacturer payment profile not found for manufacturer: " + m.getId()));

        ReceiptRequestDto.ManufacturerBlock mb = new ReceiptRequestDto.ManufacturerBlock();
        mb.setName(m.getName() != null ? m.getName() : "");
        mb.setEmailId(m.getEmailId() != null ? m.getEmailId() : "");
        mb.setPaymentMode(payment.getPreferredPaymentMode() != null ? payment.getPreferredPaymentMode() : PaymentMode.CREDIT);
        mb.setAdvanceRequired(payment.getAdvanceRequired());

        dto.setManufacturer(mb);

        if (po.getItems() == null || po.getItems().isEmpty()) {
            throw new NotFoundException("Purchase order has no items: " + po.getId());
        }

        List<ReceiptRequestDto.ItemBlock> items =
                po.getItems().stream()
                        .filter(i -> i != null && i.getSku() != null)
                        .map(i -> {
                            ReceiptRequestDto.ItemBlock item = new ReceiptRequestDto.ItemBlock();
                            item.setSku(i.getSku() != null ? i.getSku() : "");
                            item.setQuantity(i.getQuantity());
                            item.setUnitCost(i.getUnitCost() != null ? i.getUnitCost() : 0.0);
                            return item;
                        }).toList();

        dto.setItems(items);

        double subtotal = items.stream()
                .mapToDouble(i -> i.getQuantity() * i.getUnitCost())
                .sum();

        ReceiptRequestDto.TotalsBlock totals = new ReceiptRequestDto.TotalsBlock();
        totals.setSubtotal(subtotal);
        totals.setTax(subtotal * 0.05);
        totals.setGrandTotal(subtotal * 1.05);

        dto.setTotals(totals);

        return dto;
    }

    public SourcingRequestDto buildSourcingPayload(
            PurchaseOrder po,
            PaymentMode preferredPaymentMode
    ) {

        SourcingRequestDto dto = new SourcingRequestDto();

        SourcingRequestDto.Context context = new SourcingRequestDto.Context();
        context.setPurchaseOrderId(po.getId());
        context.setPreferredPaymentMode(preferredPaymentMode);
        context.setConfidence(po.getConfidence() != null ? po.getConfidence() : 0.0);
        context.setCreatedAt(po.getCreatedAt() != null ? po.getCreatedAt().toString() : "");

        dto.setContext(context);

        if (po.getItems() == null || po.getItems().isEmpty()) {
            throw new NotFoundException("Purchase order has no items: " + po.getId());
        }

        dto.setItems(
                po.getItems().stream().map(i -> {
                    SourcingRequestDto.Item item = new SourcingRequestDto.Item();
                    item.setSku(i.getSku());
                    item.setQuantity(i.getQuantity());
                    return item;
                }).toList()
        );

        List<Manufacturer> manufacturers = manufacturerRepository.findAll();
        
        if (manufacturers == null || manufacturers.isEmpty()) {
            throw new NotFoundException("No manufacturers found in the system");
        }

        List<SourcingRequestDto.ManufacturerCandidate> candidates =
                manufacturers.stream()
                        .filter(m -> m != null && m.getId() != null)
                        .map(m -> {
                            ManufacturerPaymentProfile payment =
                                    paymentProfileRepository.findByManufacturerId(m.getId())
                                            .orElseThrow(() -> new NotFoundException("Payment Profile not found for manufacturer: " + m.getId()));

                    double avgRating =
                            manufacturerRatingRepository.findAverageRating(m.getId());

                    SourcingRequestDto.ManufacturerCandidate mc =
                            new SourcingRequestDto.ManufacturerCandidate();

                    mc.setManufacturerId(m.getId());
                    mc.setDistanceKm(m.getDistanceKm() != null ? m.getDistanceKm() : 0.0);
                    mc.setAverageRating(avgRating != 0 ? avgRating : 0.0);
                    mc.setAdvanceRequired(payment.getAdvanceRequired());
                    mc.setPreferredPaymentMode(payment.getPreferredPaymentMode() != null ? payment.getPreferredPaymentMode() : PaymentMode.CREDIT);

                    List<SourcingRequestDto.ProductOffer> offers =
                            manufacturerProductRepository
                                    .findByManufacturerId(m.getId())
                                    .stream()
                                    .filter(p -> p != null && p.getProductName() != null)
                                    .map(p -> {
                                        SourcingRequestDto.ProductOffer o =
                                                new SourcingRequestDto.ProductOffer();
                                        o.setSku(p.getProductName() != null ? p.getProductName() : "");
                                        o.setCostPrice(p.getCostPrice() != null ? p.getCostPrice() : 0.0);
                                        o.setMinimumOrderQuantity(p.getMinimumOrderQuantity() != null ? p.getMinimumOrderQuantity() : 0);
                                        return o;
                                    }).toList();

                    mc.setProducts(offers);
                    return mc;
                }).toList();

        dto.setManufacturers(candidates);
        return dto;
    }
}
