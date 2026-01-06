package projects.vendex.dtos;

import lombok.Data;

@Data
public class InventoryDecisionDto {
    private String action;
    private int quantity;
    private String reason;
}
