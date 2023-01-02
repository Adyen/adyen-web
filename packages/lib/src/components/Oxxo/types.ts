import { PaymentAmount } from '../../types';

export interface OxxoVoucherResultProps {
    alternativeReference?: string;
    reference?: string;
    expiresAt?: string;
    merchantReference?: string;
    totalAmount?: PaymentAmount;
    paymentMethodType?: string;
    downloadUrl?: string;
    ref?: any;
}

export type OxxoElementData = {
    paymentMethod: {
        type: 'oxxo' | string;
    };
};
