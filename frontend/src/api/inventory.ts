import { apiClient } from './client';

// Matches ForecastAndDecisionResponseDto from Spring Boot
export interface ForecastAndDecision {
  forecast: number;
  confidence: number;
  decision: InventoryDecision | null;
}

// Matches InventoryDecisionDto from Spring Boot
export interface InventoryDecision {
  action: string;
  quantity: number;
  reason: string;
}

export interface SingleSkuForecastRequest {
  sku: string;
}

export async function forecastForSku(
  payload: SingleSkuForecastRequest
): Promise<ForecastAndDecision & { sku: string }> {
  const { data } = await apiClient.post<ForecastAndDecision>(
    '/agent/inventory/forecast',
    payload
  );
  // Add SKU to the response for display purposes
  return { ...data, sku: payload.sku };
}

export async function bulkForecast(): Promise<(ForecastAndDecision & { sku?: string })[]> {
  const { data } = await apiClient.get<ForecastAndDecision[]>(
    '/agent/inventory/forecast/all'
  );
  return data;
}

