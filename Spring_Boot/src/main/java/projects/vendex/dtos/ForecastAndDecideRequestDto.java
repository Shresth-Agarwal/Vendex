package projects.vendex.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ForecastAndDecideRequestDto {

    @JsonProperty("sales_history")
    private List<Double> salesHistory;

    @JsonProperty("current_stock")
    private int currentStock;

    @JsonProperty("unit_cost")
    private double unitCost;
}

