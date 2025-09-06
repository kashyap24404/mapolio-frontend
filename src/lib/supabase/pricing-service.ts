import { creditService } from '@/lib/services'
import { withTimeoutAndRetry } from '@/lib/services/base-service'

export const loadPricingPlan = async (setPricingPlan: Function) => {
  try {
    const { plan, error } = await creditService.getActivePricingPlan();
    if (!error && plan) {
      setPricingPlan(plan);
    } else if (error) {
      console.error('Error loading pricing plan:', error);
    }
  } catch (error) {
    console.error('Unexpected error loading pricing plan:', error);
  }
};