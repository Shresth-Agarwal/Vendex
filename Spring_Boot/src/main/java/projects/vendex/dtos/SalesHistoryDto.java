package projects.vendex.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class SalesHistoryDto {
    @JsonProperty("sales_history")
    private List<Float> salesHistory;
}
