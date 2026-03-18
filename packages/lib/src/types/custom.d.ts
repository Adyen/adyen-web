import { FastlaneWindowInstance, FastlaneOptions } from '../components/PayPalFastlane/types';
import { ApplePayButtonStyle, ApplePayButtonType, ApplePayWebConfiguration } from '../components/ApplePay/types';
import { IAdyenPasskey } from '../components/PayByBankPix/services/types';

import type {
    PayPayInitOptions,
    PayPayAuthStatusOptions,
    PayPayRenderButtonLoginOptions,
    PayPayRenderButtonPaymentOptions
} from '../components/PayPay/types';

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

        /**
         * PayPay SDK
         */
        pp: {
            init(options: PayPayInitOptions): void;
            getAuthStatus(options: PayPayAuthStatusOptions): void;
            renderButton(options: PayPayRenderButtonLoginOptions | PayPayRenderButtonPaymentOptions): void;
        };
    }
}
