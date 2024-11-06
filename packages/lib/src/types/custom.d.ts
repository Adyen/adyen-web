import type { FastlaneConstructor } from '../components/PayPalFastlane/types';

declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

declare global {
    interface Window {
        ApplePaySession?: ApplePaySession;
        paypal?: {
            Fastlane?: FastlaneConstructor;
        };
    }
}

interface Window {
    AdyenWeb: any;
    VISA_SDK?: {
        buildClientProfile?(srciDpaId?: string): any;
        correlationId?: string;
    };
}
