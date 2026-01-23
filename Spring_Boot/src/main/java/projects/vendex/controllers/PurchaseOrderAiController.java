package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.ReceiptRequestDto;
import projects.vendex.dtos.SourcingRequestDto;
import projects.vendex.entities.PurchaseOrder;
import projects.vendex.enums.PaymentMode;
import projects.vendex.repositories.PurchaseOrderRepository;
import projects.vendex.services.FastApiIntegrationService;
import projects.vendex.services.PurchaseOrderAiPayloadService;

@RestController
@RequestMapping("/demo/ai/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderAiController {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderAiPayloadService payloadService;
    private final FastApiIntegrationService fastApiIntegrationService;

    @PostMapping("/{poId}/generate-receipt")
    public ResponseEntity<byte[]> generateReceipt(@PathVariable Long poId) {

        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        ReceiptRequestDto payload = payloadService.buildReceiptPayload(po);

        byte[] pdfBytes = fastApiIntegrationService.generateReceipt(payload);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=receipt_" + poId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/{poId}/recommend-manufacturer")
    public Object recommendManufacturer(
            @PathVariable Long poId,
            @RequestParam PaymentMode preferredPaymentMode
    ) {

        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        SourcingRequestDto payload =
                payloadService.buildSourcingPayload(po, preferredPaymentMode);

        return fastApiIntegrationService.recommendManufacturer(payload);
    }
}
