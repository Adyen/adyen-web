import { FastlaneWindowInstance, FastlaneOptions } from '../components/PayPalFastlane/types';

declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

declare global {
    interface Window {
        ApplePaySession?: ApplePaySession;
        paypal?: {
            Fastlane?: (options?: FastlaneOptions) => Promise<FastlaneWindowInstance>;
        };
        AdyenWeb: any;
        VISA_SDK?: {
            buildClientProfile?(srciDpaId?: string): any;
            correlationId?: string;
        };
    }
}
