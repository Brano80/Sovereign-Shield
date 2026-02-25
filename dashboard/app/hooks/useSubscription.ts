/**
 * Stub hook — subscription management removed in API-first pivot.
 * Returns null subscription (all features available via API key tier).
 */
export interface Subscription {
  id: string;
  company_id: string;
  subscription_type: string;
  status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  days_remaining: number | null;
  monthly_price: number | null;
  annual_price: number | null;
}

export function useSubscription(_companyId?: string) {
  return { data: null as Subscription | null, isLoading: false, error: null };
}
