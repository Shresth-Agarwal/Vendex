package projects.vendex.dtos;

import lombok.Data;

@Data
public class ForecastAndDecisionResponseDto {
    private int forecast;
    private double confidence;
    private Object decision;
}
