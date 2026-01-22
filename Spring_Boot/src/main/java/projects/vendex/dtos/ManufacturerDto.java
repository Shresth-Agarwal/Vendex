package projects.vendex.dtos;

import lombok.Data;

@Data
public class ManufacturerDto {
    private Long id;
    private String name;
    private String emailId;
    private String phone;
    private String location;
    private Double distanceKm;
}
