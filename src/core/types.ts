import { CustomTranslations, Locales } from '../language/types';

export interface CoreOptions {
    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration }live environments}.
     */
    environment?: 'test' | 'live' | 'live-us' | 'live-au' | string;

    /**
     * A client-side key linked to your website, used to validate Adyen’s Web component library. Use the {@link https://docs.adyen.com/api-explorer/#/CheckoutUtility/v1/originKeys /originKeys} endpoint to generate one.
     * For more information, refer to {@link https://docs.adyen.com/user-management/how-to-get-an-origin-key How to get an origin key}.
     */
    originKey?: string;

    clientKey?: string;

    /**
     * The shopper's locale. This is used to set the language rendered in the UI.
     * For a list of supported locales, see {@link https://docs.adyen.com/checkout/components-web/localization-components Localization}.
     * @default 'en-US'
     */
    locale?: Locales;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components Localizing Components}
     */
    translations?: CustomTranslations;

    /**
     * The full `/paymentMethods` response
     */
    paymentMethodsResponse?: any;

    [key: string]: any;
}
