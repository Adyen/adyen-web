export type ClickToPayConfiguration = {
    /**
     * Shopper email used to be recognized with the Network schemes
     */
    shopperEmail?: string;
    /**
     * Shopper telephone number used to be recognized with the Network schemes
     */
    telephoneNumber?: string;
    /**
     * Used to display the merchant name in case the DCF appears (ex: first time doing transaction in the device),
     */
    merchantDisplayName?: string;
    /**
     * Used to ensure the correct language and user experience if DCF screen is displayed. As a fallback, it uses the main locale
     * defined during the creation of the Checkout.
     * Format: ISO language_country pair (e.g., en_US )
     *
     * @defaultValue en_US
     */
    locale?: string;
    /**
     * Disable autofocus on the One Time Password input field when it is either displayed or when the OTP is resent
     * @defaultValue false
     */
    disableOtpAutoFocus?: boolean;
    /**
     *  Callback triggered when the Click to Pay component is ready to be used
     */
    onReady?(): void;
};

export type ClickToPayScheme = 'mc' | 'visa';
