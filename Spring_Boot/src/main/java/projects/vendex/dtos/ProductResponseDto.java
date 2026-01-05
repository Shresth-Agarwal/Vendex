package projects.vendex.dtos;

import lombok.Data;

@Data
public class ProductResponseDto {
    private String sku;
    private String productName;
    private double unitCost;
    private boolean active;
}
