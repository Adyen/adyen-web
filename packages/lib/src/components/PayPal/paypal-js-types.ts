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
import type {
    SdkInstance,
    EligiblePaymentMethodsOutput,
    CreateInstanceOptions,
    PaymentFlow,
    OnShippingAddressChangeData as OnShippingAddressChangeDataV6,
    OnShippingOptionsChangeData as OnShippingOptionsChangeDataV6,
    OnApproveDataSavePayments,
    SavePaymentSessionOptions,
    OnApproveDataOneTimePayments,
    OneTimePaymentSession,
    SavePaymentSession
} from '@paypal/paypal-js/sdk-v6';

export type { PayPalOneTimePaymentSessionOptions } from '@paypal/paypal-js/sdk-v6';

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

export type PayPalV6OnShippingAddressChangeData = OnShippingAddressChangeDataV6;
export type PayPalV6OnShippingOptionsChangeData = OnShippingOptionsChangeDataV6;
export type PayPalV6OnApproveData = OnApproveDataOneTimePayments | OnApproveDataSavePayments;

export type PayPalSavePaymentSessionOptions = SavePaymentSessionOptions;
export type PayPalOneTimePaymentSession = OneTimePaymentSession;
export type PayPalSavePaymentSession = SavePaymentSession;
