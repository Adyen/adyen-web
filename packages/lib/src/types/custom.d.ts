import { Fastlane, FastlaneOptions } from '../components/PayPalFastlane/types';

declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

declare global {
    interface Window {
        ApplePaySession?: ApplePaySession;
        paypal?: {
            Fastlane?: (options?: FastlaneOptions) => Promise<Fastlane>;
        };
        AdyenWeb: any;
        VISA_SDK?: {
            buildClientProfile?(srciDpaId?: string): any;
            correlationId?: string;
        };
    }
}

// interface Window {
//     AdyenWeb: any;
//     VISA_SDK?: {
//         buildClientProfile?(srciDpaId?: string): any;
//         correlationId?: string;
//     };
// }
