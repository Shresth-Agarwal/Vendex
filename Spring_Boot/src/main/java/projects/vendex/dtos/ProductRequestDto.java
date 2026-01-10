package projects.vendex.dtos;

import lombok.Data;

@Data
public class ProductRequestDto {
    private String sku;
    private String productName;
    private String category;
    private double unitCost;
    private boolean active;

    private int initialStock;
}
