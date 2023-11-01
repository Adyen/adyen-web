import { PaymentAmount } from '../../types/global-types';

export interface DokuVoucherResultProps {
    reference?: string;
    totalAmount?: PaymentAmount;
    expiresAt?: string;
    paymentMethodType?: string;
    maskedTelephoneNumber?: string;
    instructionsUrl?: string;
    shopperName?: string;
    merchantName?: string;
    outputDetails?: any;
    ref?: any;
}
