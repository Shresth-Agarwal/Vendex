package projects.vendex.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DecisionPayloadDto {

    private int forecast;
    private double confidence;

    @JsonProperty("current_stock")
    private int currentStock;

    @JsonProperty("unit_cost")
    private double unitCost;
}
