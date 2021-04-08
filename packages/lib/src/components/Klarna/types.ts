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

export interface KlarnaWidgetProps {
    sdkData: KlarnaSdkData;

    paymentData: string;

    paymentMethodType: string;

    /** @internal */
    payButton: (options) => any;

    onComplete: (detailsData) => void;
    onError: (error) => void;
}

export interface KlarnaPaymentsProps extends UIElementProps {
    paymentData?: string;
    paymentMethodType?: string;
    sdkData?: KlarnaSdkData;
}
