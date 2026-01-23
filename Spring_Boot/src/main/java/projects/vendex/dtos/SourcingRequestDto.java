package projects.vendex.dtos;

import lombok.Data;
import projects.vendex.enums.PaymentMode;

import java.util.List;

@Data
public class SourcingRequestDto {

    private Context context;
    private List<Item> items;
    private List<ManufacturerCandidate> manufacturers;

    @Data
    public static class Context {
        private Long purchaseOrderId;
        private PaymentMode preferredPaymentMode;
        private Double confidence;
        private String createdAt;
    }

    @Data
    public static class Item {
        private String sku;
        private int quantity;
    }

    @Data
    public static class ManufacturerCandidate {
        private Long manufacturerId;
        private double distanceKm;
        private double averageRating;
        private boolean advanceRequired;
        private PaymentMode preferredPaymentMode;
        private List<ProductOffer> products;
    }

    @Data
    public static class ProductOffer {
        private String sku;
        private double costPrice;
        private int minimumOrderQuantity;
    }
}
