package projects.vendex.dtos;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerIntentResponseDto {

    private String action; // SUCCESS | CLARIFY | RECOMMEND

    private String intent_category; // PURCHASE | PROBLEM_SOLVING | ...

    private String message;

    private String clarifying_question;

    private List<CustomerBundleItemDto> bundle;

    private double confidence_score;
}
