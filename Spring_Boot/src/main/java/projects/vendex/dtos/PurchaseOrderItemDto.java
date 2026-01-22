package projects.vendex.dtos;

import lombok.Data;

@Data
public class PurchaseOrderItemDto {

    private String sku;

    private int quantity;
}
