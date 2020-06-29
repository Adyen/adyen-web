declare global {
    interface Window {
        amazon: object;
    }
}

export interface AmazonElementProps {
    merchantId?: string;
    currency?: string;
    environment?: string;
    locale?: string;
    placement?: 'Home' | 'Product' | 'Cart' | 'Checkout' | 'Other';
    productType?: 'PayOnly' | 'PayAndShip';
    region?: 'EU' | 'UK' | 'US';
    sessionUrl?: string;
    showPayButton: boolean;
}

interface CreateCheckoutSessionConfig {
    payloadJSON: string;
    signature: string;
    publicKeyId: string;
}

export interface AmazonPayButtonSettings {
    /**
     * Amazon Pay merchant account identifier
     */
    merchantId: string;

    /**
     * Sets button to Sandbox environment
     */
    sandbox: boolean;

    /**
     * Product type selected for checkout
     */
    productType: 'PayAndShip' | 'PayOnly';

    /**
     * Placement of the Amazon Pay button on your website
     */
    placement: 'Home' | 'Product' | 'Cart' | 'Checkout' | 'Other';

    /**
     * Language used to render the button and text on Amazon Pay hosted pages. Please note that supported language(s) is dependent on the region that your Amazon Pay account was registered for
     */
    checkoutLanguage: 'en_US' | 'en_GB' | 'de_DE' | 'fr_FR' | 'it_IT' | 'es_ES';

    /**
     * Ledger currency provided during registration for the given merchant identifier
     */
    ledgerCurrency: 'USD' | 'EUR' | 'GBP';

    /**
     * Create Checkout Session configuration
     */
    createCheckoutSessionConfig: CreateCheckoutSessionConfig;
}
