import { type ComponentMethodsRef, UIElementProps } from '../internal/UIElement/types';
import { PaymentAction } from '../../types/global-types';
import { AdditionalDetailsData } from '../../core/types';

declare global {
    interface Window {
        Klarna: IKlarna;
        klarnaAsyncCallback: IKlarnaAsyncCallback;
    }
}

interface IKlarna {
    Payments: IKlarnaPayments;
}

interface IKlarnaPayments {
  init: InitKlarnaCheckout;
  authorize: AuthorizeKlarnaCheckout;
  finalize: FinalizeKlarnaCheckout;
  Buttons: IKlarnaButtons;
}

/**
 * @see https://docs.klarna.com/payments/web-payments/additional-resources/klarna-payments-sdk-reference/#init
 */
type InitKlarnaCheckout = (args: IKlarnaCheckoutInitArgs) => IKlarnaPayments;
interface IKlarnaCheckoutInitArgs {
  client_token: string;
}

/**
 * @see https://docs.klarna.com/payments/web-payments/additional-resources/klarna-payments-sdk-reference/#authorize
 */
type AuthorizeKlarnaCheckout = (
  config: IAuthorizeKlarnaConfig,
  orderPayload: Record<string, unknown>,
  callback: AuthorizeKlarnaCheckoutCallback,
) => void;
/**
 * @see https://docs.klarna.com/payments/web-payments/additional-resources/klarna-payments-sdk-reference/#authorizecallback
 */
type AuthorizeKlarnaCheckoutCallback = (result: IAuthorizeKlarnaCheckoutCallbackArgs) => void;
interface IAuthorizeKlarnaCheckoutCallbackArgs {
  authorization_token: string;
  approved: boolean;
}
interface IAuthorizeKlarnaConfig {
  collect_shipping_address?: boolean;
  auto_finalize?: boolean;
}

/**
 * @see https://docs.klarna.com/payments/web-payments/additional-resources/klarna-payments-sdk-reference/#finalize
 */
type FinalizeKlarnaCheckout = (
  config: { payment_method_category?: string },
  orderPayload: Record<string, unknown>,
  callback: FinalizeKlarnaCheckoutCallback,
) => void;
/**
 * @see https://docs.klarna.com/payments/web-payments/additional-resources/klarna-payments-sdk-reference/#finalizecallback
 */
type FinalizeKlarnaCheckoutCallback = (result: IFinalizeKlarnaCheckoutCallbackArgs) => void;
interface IFinalizeKlarnaCheckoutCallbackArgs {
  show_form: boolean;
  approved: boolean;
  authorization_token: string;
  finalize_required: boolean;
}

interface IKlarnaButtons {
  init: InitKlarnaExpress;
  authorize: AuthorizeKlarnaExpress;
}

/**
 * @see https://docs.klarna.com/conversion-boosters/express-checkout/integrate-express-checkout/integrate-multistep-express-checkout/#integration-steps-1-initialize-and-display-the-express-checkout-button
 */
type InitKlarnaExpress = (args: IInitKlarnaExpressArgs) => IKlarnaButtons;
interface IInitKlarnaExpressArgs {
  client_id: string;
}

/**
 * @see https://docs.klarna.com/conversion-boosters/express-checkout/integrate-express-checkout/integrate-multistep-express-checkout/#integration-steps-2-handle-the-authorization-response
 */
type AuthorizeKlarnaExpress = (
  config: IAuthorizeKlarnaConfig,
  orderPayload: Record<string, unknown>,
  callback: AuthorizeKlarnaExpressCallback,
) => void;
type AuthorizeKlarnaExpressCallback = (
  args: IAuthorizeKlarnaExpressCallbackArgs,
) => void;
interface IAuthorizeKlarnaExpressCallbackArgs {
  show_form: boolean;
  approved: boolean;
  finalize_required: boolean;
  client_token: string;
  session_id: string;
  collected_shipping_address: IKlarnaAddress;
  payment_method_categories: Array<{
    asset_urls: {
      descriptive: string;
      standard: string;
    };
    identifier: string;
    name: string;
  }>;
}
interface IKlarnaAddress {
  city: string;
  country: string;
  email: string;
  family_name: string;
  given_name: string;
  phone: string;
  postal_code: string;
  region: string;
  street_address: string;
  street_address2: string;
}

/**
 * Klarna callback to load SKD
 * @see https://docs.klarna.com/payments/web-payments/integrate-with-klarna-payments/integrate-via-sdk/step-2-checkout/#set-up-klarnas-javascript-sdk-1-add-the-sdk-to-your-page
 */
type IKlarnaAsyncCallback = () => void;

/** sdkData present in Klarna `action`objects. */
export type KlarnaSdkData = {
    /**
     * Klarna client_token
     * @see https://developers.klarna.com/documentation/klarna-payments/single-call-descriptions/create-session/
     * */
    client_token: string;

    /**
     * `payment_method_category` specifies which of Klarna’s customer offerings (e.g. Pay now, Pay later or Slice it)
     * that is being shown in the widget
     * @see https://developers.klarna.com/documentation/klarna-payments/single-call-descriptions/create-session/
     * */
    payment_method_category: string;
};

interface KlarnaPaymentsShared {
    sdkData?: KlarnaSdkData;
    paymentData?: string;
    paymentMethodType?: string;
}

export interface KlarnaWidgetProps extends KlarnaPaymentsShared {
    /** @internal */
    payButton: (options) => any;
    /** @internal */
    onLoaded: () => void;

    widgetInitializationTime: number;

    onComplete: (detailsData: KlarnaAdditionalDetailsData) => void;
    onError: (error) => void;
}

export type KlarnaConfiguration = UIElementProps &
    KlarnaPaymentsShared & {
        useKlarnaWidget?: boolean;
    };

export interface KlarnaWidgetAuthorizeResponse {
    approved: boolean;
    show_form: boolean;
    authorization_token: string;
    error?: any;
}

export interface KlarnaComponentRef extends ComponentMethodsRef {
    setAction(action: KlarnaAction): void;
    reinitializeWidget(): void;
}

export interface KlarnaAction extends PaymentAction {
    sdkData: {
        client_token: string;
        payment_method_category: string;
    };
}

export interface KlarnaAdditionalDetailsData extends AdditionalDetailsData {
    data: {
        paymentData: string;
        details: {
            authorization_token?: string;
        };
    };
}
