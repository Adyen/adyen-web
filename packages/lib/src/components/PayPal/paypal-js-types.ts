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
    SavePaymentSession,
    VenmoSavePaymentSessionOptions,
    PageTypes,
    FetchContentOptions,
    PayPalMessagesSession,
    PayPalMessageElement as PayPalMessageElementV6
} from '@paypal/paypal-js/sdk-v6';

export type { PayPalOneTimePaymentSessionOptions, PayPalMessagesOptions, PayPalMessagesSession } from '@paypal/paypal-js/sdk-v6';

// Paypal SDK V5 types
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

// End of Paypal SDK V5 types

// Paypal SDK V6 types
export type PayPalPageTypes = PageTypes;
export type PayPaylComponent = 'paypal-payments' | 'venmo-payments' | 'paypal-messages';
export type PayPalComponents = Array<PayPaylComponent>;
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
export type PayPalVenmoSavePaymentSessionOptions = VenmoSavePaymentSessionOptions;
export type PayPalFetchContentOptions = FetchContentOptions;
export type PayPalMessageContent = NonNullable<Awaited<ReturnType<PayPalMessagesSession['fetchContent']>>>;
/**
 * The `<paypal-message>` custom element. The PayPal SDK types omit the `setContent` method,
 * which is the method used to render the content resolved by `fetchContent` into the element.
 */
export type PayPalMessageElement = PayPalMessageElementV6 & {
    setContent(content: PayPalMessageContent): void;
};
export type PayPalPresentationModeOptionsForPopup = {
    presentationMode: 'popup';
    fullPageOverlay?: { enabled: boolean };
};
export type PayPalPresentationModeOptionsForModal = {
    presentationMode: 'modal';
};
export type PayPalPresentationModeOptionsForRedirect = {
    presentationMode: 'redirect';
    autoRedirect?: { enabled: boolean };
    fullPageOverlay?: { enabled: boolean };
};
export type PayPalPresentationModeOptionsForPaymentHandler = {
    presentationMode: 'payment-handler';
};
export type PayPalPresentationModeOptionsForAuto = {
    presentationMode: 'auto';
    fullPageOverlay?: { enabled: boolean };
};
// End of Paypal SDK V6 types
