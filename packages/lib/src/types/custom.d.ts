import { FastlaneWindowInstance, FastlaneOptions } from '../components/PayPalFastlane/types';
import { ApplePayButtonStyle, ApplePayButtonType, ApplePayWebConfiguration } from '../components/ApplePay/types';
import { IAdyenPasskey } from '../components/PayByBankPix/services/types';
import type { KlarnaWidgetAuthorizeResponse } from '../components/Klarna/types';

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'apple-pay-button': {
                buttonstyle: ApplePayButtonStyle;
                type: ApplePayButtonType;
                locale: string;
                onclick(): void;
            };
        }
    }
}

declare global {
    interface Window {
        /**
         * Klarna
         */
        Klarna?: {
            Payments?: {
                init(config: { client_token: string }): void;
                load(
                    config: { container: string; payment_method_category: string },
                    callback: (res: { show_form: boolean; error: unknown }) => void
                ): void;
                authorize(config: { payment_method_category: string }, callback: (res: KlarnaWidgetAuthorizeResponse) => void): void;
            };
        };
        klarnaAsyncCallback?: () => void;

        paypal?: {
            Fastlane?: (options?: FastlaneOptions) => Promise<FastlaneWindowInstance>;
        };
        /**
         * ApplePaySession added by ApplePaySDK
         */
        ApplePaySession?: ApplePaySession;

        ApplePayWebOptions?: {
            set(config: ApplePayWebConfiguration): void;
            focusApplePayCodeWindow(): void;
            closeApplePayCodeWindow(): void;
        };

        AdyenWeb: any;
        VISA_SDK?: {
            buildClientProfile?(srciDpaId?: string): any;
            correlationId?: string;
        };

        AdyenPasskey: { default: IAdyenPasskey };

        SRCSDK_MASTERCARD?: object;

        vAdapters: {
            VisaSRCI?: object;
        };
    }
}
