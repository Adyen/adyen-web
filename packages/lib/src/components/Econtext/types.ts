import { PaymentAmount } from '../../types';

export interface EcontextVoucherResultProps {
    reference?: string;
    totalAmount?: PaymentAmount;
    expiresAt?: string;
    paymentMethodType?: string;
    maskedTelephoneNumber?: string;
    instructionsUrl?: string;
    ref?: any;
    collectionInstitutionNumber?: string;
}

export interface EcontextInputSchema {
    firstName?: string;
    lastName?: string;
    telephoneNumber?: string;
    shopperEmail?: string;
}
