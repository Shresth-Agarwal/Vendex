package projects.vendex.dtos;

import lombok.Data;
import projects.vendex.enums.PurchaseOrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseOrderDto {

    private Long id;
    private PurchaseOrderStatus status;
    private Double confidence;

    private String receiptUri;

    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime sentAt;
    private LocalDateTime receivedAt;

    private Long manufacturerId;

    private List<PurchaseOrderItemDto> items;
}
