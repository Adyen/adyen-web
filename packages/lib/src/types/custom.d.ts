import type { PayPalV6Namespace } from '@paypal/paypal-js/sdk-v6';

import type { FastlaneWindowInstance, FastlaneOptions } from '../components/PayPalFastlane/types';
import type { ApplePayButtonStyle, ApplePayButtonType, ApplePayWebConfiguration } from '../components/ApplePay/types';
import type { IAdyenPasskey } from '../components/PayByBankPix/services/types';
import type { AmazonWindowObject, PayPalButtonClass, PayPalButtonType, VenmoButtonClass } from '../components/PayPal/types';
import type { KlarnaWidgetAuthorizeResponse } from '../components/Klarna/types';
import type { PayPalComponents, PayPalCreateInstanceOptions, PayPalMessageElement, PayPalSdkInstance } from '../components/PayPal/paypal-js-types';

declare module '@paypal/paypal-js' {
    export interface PayPalNamespace {
        Fastlane?: (options?: FastlaneOptions) => Promise<FastlaneWindowInstance>;
        version?: string;
        /**
         * Creates an SDK instance, which is the first step in an SDK integration. This instance serves as the base layer for all SDK components.
         *
         * @remarks
         * This is an asynchronous method that initializes the PayPal SDK with the provided
         * client token and components.
         *
         * @param createInstanceOptions - Configuration options for creating the SDK instance
         * @returns A promise that resolves to an SDK instance with methods based on the specified components
         *
         * @example
         * ```typescript
         * const sdkInstance = await window.paypal.createInstance({
         *   clientToken: "your-client-token",
         *   components: ["paypal-payments"],
         *   locale: "en-US",
         *   pageType: "checkout"
         * });
         * ```
         */
        createInstance?: <T extends readonly PayPalComponents[]>(
            createInstanceOptions: PayPalCreateInstanceOptions<T>
        ) => Promise<PayPalSdkInstance<T>>;
        /**
         * If the PayPal v5 SDK is loaded with the v6 SDK, the v6 namespace will be available under the v6 property
         */
        v6?: PayPalV6Namespace;
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
            'paypal-button': {
                id?: string;
                type?: PayPalButtonType;
                class?: PayPalButtonClass;
                onclick(): void;
            };
            'paypal-pay-later-button': {
                id?: string;
                onclick(): void;
                countryCode?: string;
                productCode?: string;
            };
            'paypal-credit-button': {
                id?: string;
                onclick(): void;
                countryCode?: string;
            };
            'venmo-button': {
                id?: string;
                type?: PayPalButtonType;
                class?: VenmoButtonClass;
                onclick(): void;
            };
            'paypal-message': {
                id?: string;
                amount?: string;
                ref?: MutableRef<PayPalMessageElement>;
            };
        }
    }
}

declare global {
    interface Window {
        amazon?: AmazonWindowObject;
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
        /**
         * ApplePaySession added by ApplePaySDK
         */
        ApplePaySession?: typeof ApplePaySession;

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
