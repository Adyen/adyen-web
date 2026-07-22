import { useEffect, useState } from 'preact/hooks';

import type { PayPalService } from '../services/PayPalService';
import type { SupportedPayPalFundingSources } from '../types';

/**
 * Determines whether a given PayPal funding source is eligible for the current buyer.
 * Encapsulates the eligibility lookup shared by every V6 button component.
 *
 * @param paypalService - The PayPal service exposing the buyer's eligible payment methods
 * @param fundingSource - The funding source to check
 * @returns Whether the funding source is eligible to be rendered
 */
export const usePayPalButtonEligibility = (paypalService: PayPalService, fundingSource: SupportedPayPalFundingSources): { isEligible: boolean } => {
    const [isEligible, setIsEligible] = useState<boolean>(false);

    useEffect(() => {
        setIsEligible(() => paypalService.getEligiblePaymentMethods().isEligible(fundingSource));
    }, [paypalService, fundingSource]);

    return { isEligible };
};
