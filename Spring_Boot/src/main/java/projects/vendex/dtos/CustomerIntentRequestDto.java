package projects.vendex.dtos;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerIntentRequestDto {

    private String user_input;

    private List<StockItemDto> stock_list;
}
