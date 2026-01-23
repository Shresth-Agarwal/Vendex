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
        poBlock.setCreatedAt(po.getCreatedAt().toString());
        poBlock.setApprovedAt(po.getApprovedAt().toString());

        dto.setPurchaseOrder(poBlock);

        Manufacturer m = po.getManufacturer();
        ManufacturerPaymentProfile payment = paymentProfileRepository.findByManufacturerId(m.getId()).orElseThrow(() -> new NotFoundException("Manufacture payment profile not found"));

        ReceiptRequestDto.ManufacturerBlock mb = new ReceiptRequestDto.ManufacturerBlock();
        mb.setName(m.getName());
        mb.setEmailId(m.getEmailId());
        mb.setPaymentMode(payment.getPreferredPaymentMode());
        mb.setAdvanceRequired(payment.getAdvanceRequired());

        dto.setManufacturer(mb);

        List<ReceiptRequestDto.ItemBlock> items =
                po.getItems().stream().map(i -> {
                    ReceiptRequestDto.ItemBlock item = new ReceiptRequestDto.ItemBlock();
                    item.setSku(i.getSku());
                    item.setQuantity(i.getQuantity());
                    item.setUnitCost(i.getUnitCost());
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
        context.setConfidence(po.getConfidence());
        context.setCreatedAt(po.getCreatedAt().toString());

        dto.setContext(context);

        dto.setItems(
                po.getItems().stream().map(i -> {
                    SourcingRequestDto.Item item = new SourcingRequestDto.Item();
                    item.setSku(i.getSku());
                    item.setQuantity(i.getQuantity());
                    return item;
                }).toList()
        );

        List<Manufacturer> manufacturers = manufacturerRepository.findAll();

        List<SourcingRequestDto.ManufacturerCandidate> candidates =
                manufacturers.stream().map(m -> {

                    ManufacturerPaymentProfile payment =
                            paymentProfileRepository.findByManufacturerId(m.getId()).orElseThrow(() -> new NotFoundException("Payment Profile not found for manufacturer"));

                    double avgRating =
                            manufacturerRatingRepository.findAverageRating(m.getId());

                    SourcingRequestDto.ManufacturerCandidate mc =
                            new SourcingRequestDto.ManufacturerCandidate();

                    mc.setManufacturerId(m.getId());
                    mc.setDistanceKm(m.getDistanceKm());
                    mc.setAverageRating(avgRating);
                    mc.setAdvanceRequired(payment.getAdvanceRequired());
                    mc.setPreferredPaymentMode(payment.getPreferredPaymentMode());

                    List<SourcingRequestDto.ProductOffer> offers =
                            manufacturerProductRepository
                                    .findByManufacturerId(m.getId())
                                    .stream()
                                    .map(p -> {
                                        SourcingRequestDto.ProductOffer o =
                                                new SourcingRequestDto.ProductOffer();
                                        o.setSku(p.getProductName());
                                        o.setCostPrice(p.getCostPrice());
                                        o.setMinimumOrderQuantity(p.getMinimumOrderQuantity());
                                        return o;
                                    }).toList();

                    mc.setProducts(offers);
                    return mc;
                }).toList();

        dto.setManufacturers(candidates);
        return dto;
    }
}
