package projects.vendex.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ManufacturerRatingDto {
    private Integer rating;
    private String review;
    private LocalDateTime ratedAt;
}
