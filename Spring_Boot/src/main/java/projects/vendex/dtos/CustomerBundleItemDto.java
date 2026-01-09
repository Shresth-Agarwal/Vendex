package projects.vendex.dtos;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerBundleItemDto {

    private String sku;
    private int quantity_recommended;
    private int available_stock;
    private String status;       // AVAILABLE | OUT_OF_STOCK | SUBSTITUTE
    private String reasoning;
}
