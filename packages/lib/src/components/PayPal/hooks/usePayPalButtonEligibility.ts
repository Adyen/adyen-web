import { useEffect, useState } from 'preact/hooks';

import type { PayPalService } from '../services/PayPalService';
import type { SupportedPayPalFundingSources } from '../types';

export const usePayPalButtonEligibility = (paypalService: PayPalService, fundingSource: SupportedPayPalFundingSources): { isEligible: boolean } => {
    const [isEligible, setIsEligible] = useState<boolean>(false);

    useEffect(() => {
        setIsEligible(() => paypalService.getEligiblePaymentMethods().isEligible(fundingSource));
    }, [paypalService, fundingSource]);

    return { isEligible };
};
