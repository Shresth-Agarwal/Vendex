package projects.vendex.dtos;

import lombok.Data;
import projects.vendex.enums.PaymentMode;

import java.util.List;

@Data
public class ReceiptRequestDto {

    private PurchaseOrderBlock purchaseOrder;
    private ManufacturerBlock manufacturer;
    private List<ItemBlock> items;
    private TotalsBlock totals;

    @Data
    public static class PurchaseOrderBlock {
        private Long purchaseOrderId;
        private String createdAt;
        private String approvedAt;
    }

    @Data
    public static class ManufacturerBlock {
        private String name;
        private String emailId;
        private PaymentMode paymentMode;
        private boolean advanceRequired;
    }

    @Data
    public static class ItemBlock {
        private String sku;
        private int quantity;
        private double unitCost;
    }

    @Data
    public static class TotalsBlock {
        private double subtotal;
        private double tax;
        private double grandTotal;
    }
}
