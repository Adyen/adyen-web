import { PaymentAmount } from '../../types';

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

export interface DokuInputSchema {
    firstName?: string;
    lastName?: string;
    shopperEmail?: string;
}
