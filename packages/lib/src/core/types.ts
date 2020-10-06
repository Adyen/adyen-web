import { CustomTranslations, Locales } from '../language/types';
import { PaymentAmount, PaymentMethods, PaymentMethodOptions } from '../types';
import { AnalyticsOptions } from './Analytics/types';
import { PaymentMethodsResponseObject } from './ProcessResponse/PaymentMethodsResponse/types';
import { RiskModuleOptions } from './RiskModule/RiskModule';

export interface CoreOptions {
    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration | live environments}.
     */
    environment?: 'test' | 'live' | 'live-us' | 'live-au' | string;

    /**
     * A client-side key linked to your website, used to validate Adyen’s Web component library. Use the {@link https://docs.adyen.com/api-explorer/#/CheckoutUtility/v1/originKeys | /originKeys} endpoint to generate one.
     * For more information, refer to {@link https://docs.adyen.com/user-management/how-to-get-an-origin-key | How to get an origin key}.
     */
    originKey?: string;

    /**
     * A public key linked to your web service user, used for {@link https://docs.adyen.com/user-management/client-side-authentication | client-side authentication}.
     */
    clientKey?: string;

    /**
     * The shopper's locale. This is used to set the language rendered in the UI.
     * For a list of supported locales, see {@link https://docs.adyen.com/checkout/components-web/localization-components | Localization}.
     * For adding a custom locale, see {@link https://docs.adyen.com/checkout/components-web/localization-components#create-localization | Create localization}.
     * @defaultValue 'en-US'
     */
    locale?: Locales | string;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations;

    /**
     * The full `/paymentMethods` response
     */
    paymentMethodsResponse?: PaymentMethodsResponseObject;

    /**
     * Amount of the payment
     */
    amount?: PaymentAmount;

    /**
     * The shopper's country code. A valid value is an ISO two-character country code (e.g. 'NL').
     */
    countryCode?: string;

    /**
     * Optional per payment method configuration
     */
    paymentMethodsConfiguration?: {
        [key in keyof PaymentMethods]?: Partial<PaymentMethodOptions<key>>;
    };

    /**
     * Display only these payment methods
     */
    allowPaymentMethods?: string[];

    /**
     * Never display these payment methods
     */
    removePaymentMethods?: string[];

    analytics?: AnalyticsOptions;

    risk?: RiskModuleOptions;

    [key: string]: any;
}
