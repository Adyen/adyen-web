import { RawPaymentMethod, PaymentMethodsResponse, RawStoredPaymentMethod } from '../../../types/global-types';
import { checkPaymentMethodsResponse, processPaymentMethods, processStoredPaymentMethods } from './utils';

export type PaymentMethod = RawPaymentMethod & {
    /**
     * Internal ID generated when parsing the payment method list
     */
    _id: string;
};

export type StoredPaymentMethod = RawStoredPaymentMethod & {
    /**
     * A unique identifier of this stored payment method. Mapped from 'storedPaymentMethod.id'
     * @internal
     */
    storedPaymentMethodId?: string;
    /**
     * Internal flag
     * @internal
     */
    isStoredPaymentMethod?: boolean;
};

class PaymentMethods {
    public paymentMethods: PaymentMethod[] = [];
    public storedPaymentMethods: StoredPaymentMethod[] = [];

    constructor(response: PaymentMethodsResponse, options = {}) {
        checkPaymentMethodsResponse(response);

        this.paymentMethods = response ? processPaymentMethods(response.paymentMethods, options) : [];
        this.storedPaymentMethods = response
            ? processStoredPaymentMethods(response.storedPaymentMethods, options, response.paymentMethods || [])
            : [];
    }

    private mapCreatedComponentType(pmType: string): string {
        // Components created as 'card' need to be matched with paymentMethod response objects with type 'scheme'
        return pmType === 'card' ? 'scheme' : pmType;
    }

    has(paymentMethod: string): boolean {
        return Boolean(this.paymentMethods.find(pm => pm.type === this.mapCreatedComponentType(paymentMethod)));
    }

    find(paymentMethod: string, fundingSource?: string): PaymentMethod {
        // HACK: For card components, we need to match the fundingSource as well
        // This is because when we set splitCardFundingSources: true, we get multiple card payment methods
        // with the same type but different fundingSource values
        if (fundingSource) {
            const found = this.paymentMethods.find(
                pm => pm.type === this.mapCreatedComponentType(paymentMethod) && pm.fundingSource === fundingSource
            );
            if (found) return found;
        }
        return this.paymentMethods.find(pm => pm.type === this.mapCreatedComponentType(paymentMethod));
    }

    findById(paymentMethodId: string): PaymentMethod {
        return this.paymentMethods.find(pm => pm._id === paymentMethodId);
    }

    findStoredPaymentMethod(storedPaymentMethodId: string): StoredPaymentMethod {
        return this.storedPaymentMethods.find(pm => pm.id === storedPaymentMethodId);
    }
}

export default PaymentMethods;
