import { UIElementProps } from '../UIElement';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
};

interface KlarnaPaymentsShared {
    onKlarnaDeclined: (error) => void;

    sdkData: KlarnaSdkData;
    paymentData: string;
    paymentMethodType: string;
}

export interface KlarnaWidgetProps extends KlarnaPaymentsShared {
    /** @internal */
    payButton: (options) => any;

    onComplete: (detailsData) => void;
    onError: (error) => void;
}

export interface KlarnaPaymentsProps extends UIElementProps, KlarnaPaymentsShared {}

export interface KlarnaWidgetAuthorizeResponse {
    approved: boolean;
    show_form: boolean;
    authorization_token: string;
    error?: any;
}
