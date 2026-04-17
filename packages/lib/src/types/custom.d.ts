import { FastlaneWindowInstance, FastlaneOptions } from '../components/PayPalFastlane/types';
import { ApplePayButtonStyle, ApplePayButtonType, ApplePayWebConfiguration } from '../components/ApplePay/types';
import { IAdyenPasskey } from '../components/PayByBankPix/services/types';
import { AmazonWindowObject } from '../types';

declare module '@paypal/paypal-js' {
    export interface PayPalNamespace {
        Fastlane?: (options?: FastlaneOptions) => Promise<FastlaneWindowInstance>;
        version?: string;
    }
}

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
        amazon?: AmazonWindowObject;
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
