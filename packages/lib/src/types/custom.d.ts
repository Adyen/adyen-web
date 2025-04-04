import { FastlaneWindowInstance, FastlaneOptions } from '../components/PayPalFastlane/types';
import { ApplePayButtonStyle, ApplePayButtonType, ApplePayWebConfiguration } from '../components/ApplePay/types';

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

declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

declare global {
    interface Window {
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
    }
}
