import { InstallmentOptions } from '../../components/Card/components/CardInput/components/Installments/Installments';
import { BrowserInfo, Order, PaymentAction, PaymentAmount, ResultCode } from '../../types/global-types';
import { DonationCampaign, DonationType } from '../../components/Donation/components/types';

export type CheckoutSession = {
    id: string;
    sessionData: string;
    shopperLocale?: string;
    shopperEmail?: string;
    telephoneNumber?: string;
};

export type SessionConfiguration = {
    installmentOptions?: InstallmentOptions;
    enableStoreDetails?: boolean;
};

export type CheckoutSessionSetupResponse = {
    id: string;
    sessionData: string;
    countryCode?: string;
    amount: Omit<PaymentAmount, 'currencyDisplay'>;
    expiresAt: string;
    paymentMethods: any;
    returnUrl: string;
    configuration: SessionConfiguration;
    /**
     * 'shopperLocale' set during session creation.
     * @defaultValue en-US
     */
    shopperLocale: string;
};

export type CheckoutSessionPaymentResponse = {
    sessionData: string;
    sessionResult: string;
    status?: string;
    resultCode: ResultCode;
    action?: PaymentAction;
};

export type CheckoutSessionDetailsResponse = {
    sessionData: string;
    sessionResult: string;
    resultCode: ResultCode;
    status?: string;
    action?: PaymentAction;
};

export type CheckoutSessionBalanceResponse = {
    sessionData: string;
    balance?: PaymentAmount;
    transactionLimit?: PaymentAmount;
};

export type CheckoutSessionOrdersResponse = {
    sessionData: string;
    orderData: string;
    pspReference: string;
};

export type CheckoutSessionDonationCampaignsResponse = {
    sessionData: string;
    donationCampaigns: DonationCampaign[];
};

// TODO - confirm type
export type CheckoutSessionDonationsResponse = {
    sessionData: string;
};

export type CheckoutSessionDonationsRequestData = {
    donationCampaignId: string;
    donationType: DonationType;
    amount: PaymentAmount;
};

export type SetupSessionOptions = {
    browserInfo?: BrowserInfo;
    order?: Order;
};
