import { useMemo } from 'preact/hooks';

import type { PayPalService } from '../services/PayPalService';
import type { SupportedPayPalFundingSources } from '../types';

export const usePayPalButtonEligibility = (paypalService: PayPalService, fundingSource: SupportedPayPalFundingSources): { isEligible: boolean } => {
    return useMemo(() => ({ isEligible: paypalService.getEligiblePaymentMethods().isEligible(fundingSource) }), [paypalService, fundingSource]);
};
