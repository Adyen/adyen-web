import type { AddressData } from '../../../types/global-types';
import type { KlarnaLineItem, KlarnaShippingAddress, KlarnaShippingOption, KlarnaShippingUpdatePayload } from '../klarna-web-sdk-types';
import type { KlarnaNetworkDeliveryMethod, KlarnaNetworkShippingOptionSelectedData, KlarnaNetworkShippingUpdate, LineItem } from '../types';

const DEFAULT_SHIPPING_TYPE = 'TO_DOOR';

function mapLineItemToKlarna(item: LineItem): KlarnaLineItem {
    const reference = item.id ?? item.sku;

    return {
        name: item.description,
        quantity: item.quantity,
        unitPrice: item.amountIncludingTax,
        totalAmount: item.amountIncludingTax * item.quantity,
        totalTaxAmount: (item.taxAmount ?? 0) * item.quantity,
        ...(item.taxPercentage !== undefined && { taxRate: item.taxPercentage }),
        ...(reference && { reference }),
        ...(item.imageUrl && { imageUrl: item.imageUrl }),
        ...(item.productUrl && { productUrl: item.productUrl })
    };
}

function mapDeliveryMethodToKlarna(method: KlarnaNetworkDeliveryMethod): KlarnaShippingOption {
    return {
        shippingOptionReference: method.reference,
        displayName: method.description,
        amount: Number(method.amount.value),
        shippingType: DEFAULT_SHIPPING_TYPE
    };
}

export function mapShippingUpdateToKlarna(update: KlarnaNetworkShippingUpdate): KlarnaShippingUpdatePayload {
    const { amount, lineItems, deliveryMethods } = update;
    const selectedShippingOptionReference = deliveryMethods?.find(method => method.selected)?.reference;

    return {
        amount: Number(amount.value),
        currency: amount.currency,
        ...(lineItems && { lineItems: lineItems.map(mapLineItemToKlarna) }),
        ...(deliveryMethods && { shippingOptions: deliveryMethods.map(mapDeliveryMethodToKlarna) }),
        ...(selectedShippingOptionReference && { selectedShippingOptionReference })
    };
}

export function mapKlarnaAddressToAdyen(address: KlarnaShippingAddress = {}): Partial<AddressData> {
    const mapped: Partial<AddressData> = {
        street: address.streetAddress,
        houseNumberOrName: address.streetAddress2,
        postalCode: address.postalCode,
        city: address.city,
        stateOrProvince: address.region,
        country: address.country
    };

    return Object.fromEntries(Object.entries(mapped).filter(([, value]) => value !== undefined));
}

export function mapKlarnaShippingOptionToAdyen(
    option: KlarnaShippingOption,
    currency: string
): KlarnaNetworkShippingOptionSelectedData['selectedDeliveryMethod'] {
    return {
        reference: option.shippingOptionReference,
        ...(option.displayName && { description: option.displayName }),
        amount: { value: option.amount, currency }
    };
}
