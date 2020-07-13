import { PaymentMethod, StoredPaymentMethod } from '../../../types';

export interface PaymentMethodsResponseObject {
    /**
     * Detailed list of payment methods required to generate payment forms.
     */
    paymentMethods: PaymentMethod[];

    /**
     * List of all stored payment methods.
     */
    storedPaymentMethods?: StoredPaymentMethod[];

    groups?: any;
    oneClickPaymentMethods?: any;
}
