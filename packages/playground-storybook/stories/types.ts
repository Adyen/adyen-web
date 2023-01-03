export type GlobalArgs = {
    useSessions: boolean;
    countryCode: string;
    shopperLocale: string;
    amount: number;
    showPayButton: boolean;
};

export type AdyenCheckoutProps = {
    showPayButton: boolean;
    paymentMethodsConfiguration?: Record<string, object>;
    countryCode: string;
    shopperLocale: string;
    amount: number;
};
