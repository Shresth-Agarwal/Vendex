package projects.vendex.services;

import projects.vendex.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class InventoryMlService {

    private final WebClient inventoryMlWebClient;

    public ForecastResponseDto getForecast(SalesHistoryDto request) {
        System.out.println("Received DTO: " + request);
        return inventoryMlWebClient.post()
                .uri("/api/forecast")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ForecastResponseDto.class)
                .block();
    }

    public InventoryDecisionDto getDecision(DecisionPayloadDto payload) {
        return inventoryMlWebClient.post()
                .uri("/api/decision")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(InventoryDecisionDto.class)
                .block();
    }


    public ForecastAndDecisionResponseDto forecastAndDecide(ForecastAndDecideRequestDto request) {

        return inventoryMlWebClient.post()
                .uri("/api/forecast-and-decide")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ForecastAndDecisionResponseDto.class)
                .block();
    }
}

