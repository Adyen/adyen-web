import type { UIElementProps } from '../internal/UIElement/types';
import type { AddressData, PaymentAmount } from '../../types/global-types';
import type { KlarnaShippingConfig } from './klarna-web-sdk-types';
import type KlarnaNetworkExpress from './KlarnaNetworkExpress';

/**
 * Line item in the same shape as the `/payments` request `lineItems`.
 */
export interface LineItem {
    id?: string;
    sku?: string;
    description: string;
    quantity: number;
    amountIncludingTax: number;
    amountExcludingTax?: number;
    taxAmount?: number;
    /** Tax percentage in minor units, e.g. 2100 = 21% */
    taxPercentage?: number;
    imageUrl?: string;
    productUrl?: string;
}

export interface KlarnaNetworkDeliveryMethod {
    reference: string;
    description: string;
    type?: 'Shipping';
    amount: PaymentAmount;
    selected?: boolean;
}

export interface KlarnaNetworkShippingUpdate {
    amount: PaymentAmount;
    lineItems?: LineItem[];
    deliveryMethods?: KlarnaNetworkDeliveryMethod[];
}

export interface KlarnaNetworkShippingActions<T> {
    resolve(update: T): void;
    reject(reason?: string): void;
}

export interface KlarnaNetworkShippingAddressChangeData {
    shippingAddress: Partial<AddressData>;
}

export interface KlarnaNetworkShippingOptionSelectedData {
    /** Klarna only sends the reference of the selected option, not its amount or description. */
    selectedDeliveryMethod: {
        reference: string;
    };
}

export interface KlarnaNetworkAuthorizeResult {
    paymentRequestId?: string;
}

/** Regular checkout: the standalone component and Drop-in. */
export interface KlarnaNetworkConfiguration extends UIElementProps {
    clientId: string;
    partnerAccountId?: string;
    paymentAccountId?: string;
}

/** Express Checkout: KlarnaNetworkExpress. */
export interface KlarnaNetworkExpressConfiguration extends KlarnaNetworkConfiguration {
    /**
     * Lets the shopper edit the shipping address inside Klarna.
     * Returned with the `paymentRequestId` from the button `initiate` callback.
     */
    shippingConfig?: KlarnaShippingConfig;

    onShippingAddressChange?(
        data: KlarnaNetworkShippingAddressChangeData,
        actions: KlarnaNetworkShippingActions<KlarnaNetworkShippingUpdate>,
        component: KlarnaNetworkExpress
    ): void;

    onShippingOptionSelected?(
        data: KlarnaNetworkShippingOptionSelectedData,
        actions: KlarnaNetworkShippingActions<Omit<KlarnaNetworkShippingUpdate, 'deliveryMethods'>>,
        component: KlarnaNetworkExpress
    ): void;
}
