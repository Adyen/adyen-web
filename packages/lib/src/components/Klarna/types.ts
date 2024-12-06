import { type ComponentMethodsRef, UIElementProps } from '../internal/UIElement/types';
import { PaymentAction } from '../../types/global-types';
import { AdditionalDetailsData } from '../../core/types';

declare global {
    interface Window {
        Klarna: any;
        klarnaAsyncCallback: any;
    }
}

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
