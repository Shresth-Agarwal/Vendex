import { apiClient } from './client';

// Matches CustomerBundleItemDto from Spring Boot
export interface CustomerBundleItem {
  sku: string;
  quantity_recommended: number;
  available_stock: number;
  status: string; // AVAILABLE | OUT_OF_STOCK | SUBSTITUTE
  reasoning: string;
}

export interface CustomerIntentResponse {
  action: string; // SUCCESS | CLARIFY | RECOMMEND
  intent_category: string; // PURCHASE | PROBLEM_SOLVING | ...
  message: string;
  clarifying_question?: string;
  bundle?: CustomerBundleItem[];
  confidence_score: number;
}

export async function processCustomerIntent(
  userInput: string
): Promise<CustomerIntentResponse> {
  const params = new URLSearchParams({ userInput });
  // Use a longer timeout specifically for customer intent (Python AI can be slow)
  const { data } = await apiClient.post<CustomerIntentResponse>(
    `/demo/ai/customer/process-intent?${params.toString()}`,
    {},
    {
      timeout: 15000 // 15 seconds for customer intent calls
    }
  );
  return data;
}

