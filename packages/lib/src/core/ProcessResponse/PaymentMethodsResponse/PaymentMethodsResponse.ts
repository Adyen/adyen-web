import { PaymentMethod } from '../../../types';
import { checkPaymentMethodsResponse, processPaymentMethods, processStoredPaymentMethods } from './utils';

class PaymentMethodsResponse {
    public paymentMethods: PaymentMethod[] = [];
    public storedPaymentMethods: PaymentMethod[] = [];

    constructor(response, options = {}) {
        checkPaymentMethodsResponse(response);

        this.paymentMethods = response ? processPaymentMethods(response.paymentMethods, options) : [];
        this.storedPaymentMethods = response ? processStoredPaymentMethods(response.storedPaymentMethods, options) : [];
    }

    has(paymentMethod: string): boolean {
        return Boolean(this.paymentMethods.find(pm => pm.type === paymentMethod));
    }

    find(paymentMethod: string): PaymentMethod {
        return this.paymentMethods.find(pm => pm.type === paymentMethod);
    }
}

export default PaymentMethodsResponse;
