/**
 * Mock merchant data for the shipping callbacks of the Klarna Express story.
 *
 * Everything here runs in the browser for demo purposes only. A real merchant must do this on its backend:
 * validate the shipping address, price the shipping and return the new order total.
 */
import type { KlarnaNetworkDeliveryMethod, KlarnaNetworkExpressConfiguration, KlarnaNetworkShippingUpdate, LineItem } from '../types';

/** Filter the browser console by "[KlarnaExpress]" to follow the flow. */
export function logKlarnaEvent(step: string, payload?: unknown): void {
    console.info('[KlarnaExpress]', step, payload);
}

export const ON_SHIPPING_ADDRESS_CHANGE_DATA = {
    currency: 'USD',
    shipsToCountry: 'US',

    //cart: [{ id: 'sneakers-001', description: 'Running sneakers', quantity: 1, amountIncludingTax: 9500 }] satisfies LineItem[],
    cart: [{ id: 'sneakers-001', description: 'Running sneakers', quantity: 1, amountIncludingTax: 25900 }] satisfies LineItem[],

    shippingOptions: [
        { reference: 'standard', description: 'Standard Ground', price: 500 },
        { reference: 'express', description: 'Express Shipping', price: 1599 }
    ],

    // Preselected after an address change
    defaultShippingOption: 'standard'
};

export type OnShippingAddressChangeData = typeof ON_SHIPPING_ADDRESS_CHANGE_DATA;

/** Cart + selected shipping as one more line item, and the new total. */
function priceOrder(
    shippingData: OnShippingAddressChangeData,
    shippingReference: string
): Required<Pick<KlarnaNetworkShippingUpdate, 'amount' | 'lineItems'>> {
    const shipping = shippingData.shippingOptions.find(option => option.reference === shippingReference);
    if (!shipping) throw new Error(`Unknown shipping option: ${shippingReference}`);

    const shippingLine: LineItem = {
        id: `shipping-${shipping.reference}`,
        description: shipping.description,
        quantity: 1,
        amountIncludingTax: shipping.price,
        taxAmount: 0,
        taxPercentage: 0
    };
    const lineItems = [...shippingData.cart, shippingLine];
    const total = lineItems.reduce((sum, item) => sum + item.amountIncludingTax * item.quantity, 0);

    return { amount: { value: total, currency: shippingData.currency }, lineItems };
}

/** The shipping options in Adyen's delivery method format, with one of them selected. */
function deliveryMethods(shippingData: OnShippingAddressChangeData, selectedReference: string): KlarnaNetworkDeliveryMethod[] {
    return shippingData.shippingOptions.map(option => ({
        reference: option.reference,
        description: option.description,
        type: 'Shipping',
        amount: { value: option.price, currency: shippingData.currency },
        selected: option.reference === selectedReference
    }));
}

export function createShippingCallbacks(
    shippingData: OnShippingAddressChangeData = ON_SHIPPING_ADDRESS_CHANGE_DATA
): Required<Pick<KlarnaNetworkExpressConfiguration, 'onShippingAddressChange' | 'onShippingOptionSelected'>> {
    return {
        // Klarna sent the shopper's address: answer with the new total and the shipping options
        onShippingAddressChange(data, actions) {
            logKlarnaEvent('onShippingAddressChange: received', data);

            const update = {
                ...priceOrder(shippingData, shippingData.defaultShippingOption),
                deliveryMethods: deliveryMethods(shippingData, shippingData.defaultShippingOption)
            };
            logKlarnaEvent('onShippingAddressChange: resolved', update);
            actions.resolve(update);
        },

        // The shopper picked a shipping option: Klarna only sends its reference, so look up the price again
        onShippingOptionSelected(data, actions) {
            logKlarnaEvent('onShippingOptionSelected: received', data);
            const update = priceOrder(shippingData, data.selectedDeliveryMethod.reference);
            logKlarnaEvent('onShippingOptionSelected: resolved', update);
            actions.resolve(update);
        }
    };
}
