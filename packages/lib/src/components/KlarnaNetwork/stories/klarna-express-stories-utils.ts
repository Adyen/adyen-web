/**
 * We are handling delivery methods update, validations, and final amount calculation on the UI side for DEMO purposes.
 * This must be implemented on the backend side by the merchant for safety reasons.
 */
import type { KlarnaNetworkConfiguration, KlarnaNetworkDeliveryMethod, KlarnaNetworkShippingUpdate, LineItem } from '../types';

export type KlarnaExpressLog = (step: string, payload?: unknown) => void;

export const EXPRESS_CURRENCY = 'USD';
export const SUPPORTED_SHIPPING_COUNTRY = 'US';

// Totals 25900, matching the default storybook amount sent in /payments
export const CART_LINE_ITEMS: LineItem[] = [
    {
        id: 'sneakers-001',
        description: 'Running sneakers',
        quantity: 1,
        amountIncludingTax: 12100,
        amountExcludingTax: 10000,
        taxAmount: 2100,
        taxPercentage: 2100
    },
    {
        id: 'socks-002',
        description: 'Sport socks',
        quantity: 2,
        amountIncludingTax: 6900,
        amountExcludingTax: 6000,
        taxAmount: 900,
        taxPercentage: 1500
    }
];

const DELIVERY_METHODS_US: ReadonlyArray<Omit<KlarnaNetworkDeliveryMethod, 'selected'>> = [
    { reference: 'standard', description: 'Standard Ground', type: 'Shipping', amount: { value: 500, currency: EXPRESS_CURRENCY } },
    { reference: 'express', description: 'Express Shipping', type: 'Shipping', amount: { value: 1599, currency: EXPRESS_CURRENCY } },
    { reference: 'teleport', description: 'Teleport Shipping Ultra fast', type: 'Shipping', amount: { value: 5000, currency: EXPRESS_CURRENCY } }
];

export const DEFAULT_DELIVERY_METHOD = 'standard';
export const UNSUPPORTED_DELIVERY_METHOD = 'teleport';

export function getDeliveryMethods(country: string, selectedRef: string): KlarnaNetworkDeliveryMethod[] {
    if (country !== SUPPORTED_SHIPPING_COUNTRY) throw new Error(`Unsupported shipping country: ${country}`);
    return DELIVERY_METHODS_US.map(method => ({ ...method, selected: method.reference === selectedRef }));
}

function getCartTotal(): number {
    return CART_LINE_ITEMS.reduce((total, item) => total + item.amountIncludingTax * item.quantity, 0);
}

export function buildShippingUpdate(country: string, selectedRef: string): Required<KlarnaNetworkShippingUpdate> {
    const deliveryMethods = getDeliveryMethods(country, selectedRef);
    const selected = deliveryMethods.find(method => method.selected);
    if (!selected) throw new Error(`Unknown delivery method: ${selectedRef}`);

    const shippingLine: LineItem = {
        id: `shipping-${selected.reference}`,
        description: selected.description,
        quantity: 1,
        amountIncludingTax: selected.amount.value,
        taxAmount: 0,
        taxPercentage: 0
    };

    return {
        amount: { value: getCartTotal() + selected.amount.value, currency: EXPRESS_CURRENCY },
        lineItems: [...CART_LINE_ITEMS, shippingLine],
        deliveryMethods
    };
}

export function createMerchantCallbacks(
    log: KlarnaExpressLog
): Required<Pick<KlarnaNetworkConfiguration, 'onShippingAddressChange' | 'onShippingOptionSelected'>> {
    let shippingCountry = SUPPORTED_SHIPPING_COUNTRY;

    return {
        onShippingAddressChange(data, actions) {
            log('onShippingAddressChange: received', data);
            const country = data.shippingAddress.country;

            if (country !== SUPPORTED_SHIPPING_COUNTRY) {
                log('onShippingAddressChange: rejected', { reason: 'UNSUPPORTED_SHIPPING_ADDRESS', country });
                actions.reject('UNSUPPORTED_SHIPPING_ADDRESS');
                return;
            }

            shippingCountry = country;
            const update = buildShippingUpdate(country, DEFAULT_DELIVERY_METHOD);
            log('onShippingAddressChange: resolved', update);
            actions.resolve(update);
        },

        onShippingOptionSelected(data, actions) {
            log('onShippingOptionSelected: received', data);
            const { reference } = data.selectedDeliveryMethod;

            if (reference === UNSUPPORTED_DELIVERY_METHOD) {
                log('onShippingOptionSelected: rejected', { reason: 'UNSUPPORTED_SHIPPING_OPTION', reference });
                actions.reject('UNSUPPORTED_SHIPPING_OPTION');
                return;
            }

            const { amount, lineItems } = buildShippingUpdate(shippingCountry, reference);
            const update = { amount, lineItems };
            log('onShippingOptionSelected: resolved', update);
            actions.resolve(update);
        }
    };
}
