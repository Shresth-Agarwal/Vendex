package projects.vendex.dtos;

import lombok.Data;

@Data
public class ManufacturerProductDto {
    private Long id;
    private String brand;
    private String category;
    private String productName;
    private Integer minimumOrderQuantity;
    private Double costPrice;
}
