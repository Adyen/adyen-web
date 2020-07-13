import { PaymentAmount } from '../../types';

export interface MultibancoVoucherResultProps {
    entity?: string;
    reference?: string;
    expiresAt?: string;
    merchantReference?: string;
    totalAmount?: PaymentAmount;
    paymentMethodType?: string;
    downloadUrl?: string;
    ref?: any;
}
