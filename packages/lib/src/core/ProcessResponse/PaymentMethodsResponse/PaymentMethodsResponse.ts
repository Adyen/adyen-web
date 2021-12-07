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

    private mapCreatedComponentType(pmType: string): string {
        return pmType === 'card' ? 'scheme' : pmType;
    }

    has(paymentMethod: string): boolean {
        return Boolean(this.paymentMethods.find(pm => pm.type === this.mapCreatedComponentType(paymentMethod)));
    }

    find(paymentMethod: string): PaymentMethod {
        return this.paymentMethods.find(pm => pm.type === this.mapCreatedComponentType(paymentMethod));
    }
}

export default PaymentMethodsResponse;
