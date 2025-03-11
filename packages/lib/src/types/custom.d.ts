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
