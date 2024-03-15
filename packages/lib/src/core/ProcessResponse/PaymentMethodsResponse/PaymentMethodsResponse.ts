import { PaymentMethod, StoredPaymentMethod } from '../../../types';
import { checkPaymentMethodsResponse, processPaymentMethods, processStoredPaymentMethods } from './utils';
import { PaymentMethodsResponse as PaymentMethodsResponseType } from './types';

class PaymentMethodsResponse {
    public paymentMethods: PaymentMethod[] = [];
    public storedPaymentMethods: StoredPaymentMethod[] = [];

    constructor(response: PaymentMethodsResponseType, options = {}) {
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
        const found = this.paymentMethods.find(pm => pm.type === this.mapCreatedComponentType(paymentMethod));
        if (paymentMethod === 'upi') {
            return {
                ...found,
                appIds: [
                    {
                        id: 'bhim',
                        name: 'BHIM'
                    },
                    {
                        id: 'gpay',
                        name: 'Google Pay'
                    },
                    {
                        id: 'PhonePe',
                        name: 'phonepe'
                    }
                ]
            };
        }
        return found;
    }
}

export default PaymentMethodsResponse;
