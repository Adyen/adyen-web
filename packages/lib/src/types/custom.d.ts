import { ApplePayButtonStyle, ApplePayButtonType } from '../components/ApplePay/types';

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
        AdyenWeb: any;
        VISA_SDK?: {
            buildClientProfile?(srciDpaId?: string): any;
            correlationId?: string;
        };
    }
}
