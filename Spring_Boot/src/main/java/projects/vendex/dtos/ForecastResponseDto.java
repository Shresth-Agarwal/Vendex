package projects.vendex.dtos;

import lombok.Data;

@Data
public class ForecastResponseDto {
    private int forecast;
    private double confidence;
}
