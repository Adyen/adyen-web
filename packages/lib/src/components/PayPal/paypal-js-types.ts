import type {
    OrderResponseBody,
    OnApproveData,
    OnApproveActions,
    OnShippingAddressChangeData,
    OnShippingAddressChangeActions,
    OnShippingOptionsChangeData,
    OnShippingOptionsChangeActions,
    OnInitActions
} from '@paypal/paypal-js';
import type { SdkInstance, EligiblePaymentMethodsOutput, CreateInstanceOptions, PaymentFlow } from '@paypal/paypal-js/sdk-v6';

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

export type PayPalComponents = ['paypal-payments', 'venmo-payments'];

export type PayPalSdkInstance = SdkInstance<PayPalComponents>;

export type PayPalCreateInstanceOptions = CreateInstanceOptions<PayPalComponents>;

export type PayPalEligiblePaymentMethods = EligiblePaymentMethodsOutput;

export type PayPalPaymentFlow = PaymentFlow;
