package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import projects.vendex.dtos.ReceiptRequestDto;
import projects.vendex.dtos.SourcingRequestDto;

@Service
@RequiredArgsConstructor
public class FastApiIntegrationService {

    private final WebClient fastApiWebClient;

    /**
     * Calls FastAPI /api/generate-receipt
     * Returns PDF as byte[]
     */
    public byte[] generateReceipt(ReceiptRequestDto payload) {

        return fastApiWebClient.post()
                .uri("/api/generate-receipt")
                .bodyValue(payload)
                .retrieve()
                .onStatus(
                        HttpStatusCode::is4xxClientError,
                        response -> Mono.error(
                                new RuntimeException("FastAPI 4xx error while generating receipt")
                        )
                )
                .onStatus(
                        HttpStatusCode::is5xxServerError,
                        response -> Mono.error(
                                new RuntimeException("FastAPI 5xx error while generating receipt")
                        )
                )
                .bodyToMono(byte[].class)
                .block();
    }

    /**
     * Calls FastAPI /api/sourcing/recommend
     * Returns JSON (recommendation result)
     */
    public Object recommendManufacturer(SourcingRequestDto payload) {

        return fastApiWebClient.post()
                .uri("/api/sourcing/recommend")
                .bodyValue(payload)
                .retrieve()
                .onStatus(
                        HttpStatusCode::is4xxClientError,
                        response -> Mono.error(
                                new RuntimeException("FastAPI 4xx error while recommending manufacturer")
                        )
                )
                .onStatus(
                        HttpStatusCode::is5xxServerError,
                        response -> Mono.error(
                                new RuntimeException("FastAPI 5xx error while recommending manufacturer")
                        )
                )
                .bodyToMono(Object.class)
                .block();
    }
}
