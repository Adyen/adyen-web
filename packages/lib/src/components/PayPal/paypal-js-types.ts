import {
    OrderResponseBody,
    OnApproveData,
    OnApproveActions,
    OnShippingAddressChangeData,
    OnShippingAddressChangeActions,
    OnShippingOptionsChangeData,
    OnShippingOptionsChangeActions,
    OnInitActions
} from '@paypal/paypal-js';

export type PayPalOrderResponseBody = OrderResponseBody;
export type PayPalOnApproveData = OnApproveData;
export type PayPalOnApproveActions = OnApproveActions;
export type PayPalOnShippingAddressChangeData = OnShippingAddressChangeData & {
    errors: Record<string, string>;
};
export type PayPalOnShippingAddressChangeActions = OnShippingAddressChangeActions;
export type PayPalOnShippingOptionsChangeData = OnShippingOptionsChangeData & {
    errors: Record<string, string>;
};
export type PayPalOnShippingOptionsChangeActions = OnShippingOptionsChangeActions;
export type PayPalOnInitActions = OnInitActions;
