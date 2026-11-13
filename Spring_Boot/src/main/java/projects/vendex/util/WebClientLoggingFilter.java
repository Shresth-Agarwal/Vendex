package projects.vendex.util;

import org.springframework.web.reactive.function.client.ExchangeFilterFunction;

import lombok.extern.slf4j.Slf4j;

/**
 * Request/Response logging interceptor for WebClient
 * Logs all HTTP interactions with FastAPI
 */
@Slf4j
public class WebClientLoggingFilter {

    public static ExchangeFilterFunction logRequest() {
        return (request, next) -> {
            log.info("================== OUTGOING REQUEST ==================");
            log.info("Sending request to FastAPI service");
            return next.exchange(request)
                .doOnNext(response -> {
                    log.info("================== RESPONSE RECEIVED ==================");
                    log.info("FastAPI responded with status: {}", response.statusCode());
                })
                .doOnError(error -> {
                    log.error("================== REQUEST FAILED ==================");
                    log.error("FastAPI request error: {}", error.getMessage());
                });
        };
    }

    public static ExchangeFilterFunction logResponse() {
        return (request, next) -> {
            log.debug("Processing WebClient request");
            return next.exchange(request)
                .doFinally(signal -> {
                    log.debug("WebClient request completed");
                });
        };
    }
}
