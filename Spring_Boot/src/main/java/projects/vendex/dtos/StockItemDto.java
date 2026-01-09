package projects.vendex.dtos;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockItemDto {

    private String sku;
    private String name;
    private int onHand;
}
