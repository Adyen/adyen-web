import { PaymentMethod, PaymentMethodsResponse, StoredPaymentMethod } from '../../../types';
import { checkPaymentMethodsResponse, processPaymentMethods, processStoredPaymentMethods } from './utils';

class PaymentMethods {
    public paymentMethods: PaymentMethod[] = [];
    public storedPaymentMethods: StoredPaymentMethod[] = [];

    constructor(response: PaymentMethodsResponse, options = {}) {
        checkPaymentMethodsResponse(response);

        this.paymentMethods = response ? processPaymentMethods(response.paymentMethods, options) : [];
        this.storedPaymentMethods = response ? processStoredPaymentMethods(response.storedPaymentMethods, options) : [];
    }

    private mapCreatedComponentType(pmType: string): string {
        // Components created as 'card' need to be matched with paymentMethod response objects with type 'scheme'
        return pmType === 'card' ? 'scheme' : pmType;
    }

    has(paymentMethod: string): boolean {
        return Boolean(this.paymentMethods.find(pm => pm.type === this.mapCreatedComponentType(paymentMethod)));
    }

    find(paymentMethod: string): PaymentMethod {
        return this.paymentMethods.find(pm => pm.type === this.mapCreatedComponentType(paymentMethod));
    }
}

export default PaymentMethods;
