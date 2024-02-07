import { SUPPORTED_LOCALES_EU, SUPPORTED_LOCALES_US } from './config';
import { UIElementProps } from '../internal/UIElement/types';
import { BrowserInfo, PaymentAmount } from '../../types/global-types';
import { onSubmitGenericType } from '../../core/types';
import { AmazonPayElement } from './AmazonPay';

declare global {
    interface Window {
        amazon: object;
    }
}

type ButtonColor = 'Gold' | 'LightGray' | 'DarkGray';
type Placement = 'Home' | 'Product' | 'Cart' | 'Checkout' | 'Other';
type ProductType = 'PayOnly' | 'PayAndShip';
type ChargePermissionType = 'OneTime' | 'Recurring';
type FrequencyUnit = 'Year' | 'Month' | 'Week' | 'Day' | 'Variable';
export type Currency = 'EUR' | 'GBP' | 'USD';
export type Region = 'EU' | 'UK' | 'US';
export type SupportedLocale = (typeof SUPPORTED_LOCALES_EU)[number] | (typeof SUPPORTED_LOCALES_US)[number];

export interface RecurringMetadata {
    frequency: {
        unit: string;
        value: FrequencyUnit;
    };
    amount: {
        amount: string;
        currencyCode: Currency;
    };
}

export interface AmazonPayBackendConfiguration {
    merchantId?: string;
    publicKeyId?: string;
    region?: Region;
    storeId?: string;
}

export interface AmazonPayConfiguration extends UIElementProps {
    addressDetails?: AddressDetails;
    amazonPayToken?: string;
    amazonCheckoutSessionId?: string;
    amount?: PaymentAmount;
    buttonColor?: ButtonColor;
    cancelUrl?: string;
    chargePermissionType?: ChargePermissionType;
    clientKey?: string;
    configuration?: AmazonPayBackendConfiguration;
    currency?: Currency;
    deliverySpecifications?: DeliverySpecifications;
    environment?: string;
    loadingContext?: string;
    locale?: string;
    merchantMetadata?: MerchantMetadata;
    onSubmit?: onSubmitGenericType<AmazonPayElement>;
    payButton?: any;
    placement?: Placement;
    productType?: ProductType;
    recurringMetadata?: RecurringMetadata;
    returnUrl?: string;
    showChangePaymentDetailsButton?: boolean;
    showOrderButton?: boolean;
    showPayButton?: boolean;
    showSignOutButton?: boolean;
    signature?: string;
    onClick?: (resolve, reject) => Promise<void>;
    onError?: (error, component) => void;
    onSignOut?: (resolve, reject) => Promise<void>;
}

export interface AmazonPayComponentProps extends AmazonPayConfiguration {
    showPayButton: boolean;
    showSignOutButton?: boolean;
    amazonCheckoutSessionId?: string;
    showOrderButton?: boolean;
    showChangePaymentDetailsButton?: boolean;
    onClick: (resolve, reject) => Promise<void>;
    onError: (error, component) => void;
    onSignOut: (resolve, reject) => Promise<void>;
    ref: any;
}

export interface AmazonPayButtonProps {
    amount?: PaymentAmount;
    amazonRef: any;
    buttonColor?: ButtonColor;
    cancelUrl?: string;
    chargePermissionType?: ChargePermissionType;
    clientKey?: string;
    configuration?: AmazonPayBackendConfiguration;
    currency?: Currency;
    deliverySpecifications?: DeliverySpecifications;
    design?: string;
    environment?: string;
    locale?: string;
    onClick: (resolve, reject) => Promise<void>;
    onError: (error, component) => void;
    placement?: Placement;
    productType?: ProductType;
    recurringMetadata?: RecurringMetadata;
    ref: any;
    returnUrl?: string;
    showPayButton: boolean;
}

export interface SignOutButtonProps {
    amazonRef: any;
    onSignOut: (resolve, reject) => Promise<void>;
}

export interface ChangePaymentDetailsButtonProps {
    amazonCheckoutSessionId: string;
    amazonRef: any;
}

export interface ChangeActionOptions {
    amazonCheckoutSessionId: string;
    changeAction: 'changeAddress' | 'changePayment';
}

export interface OrderButtonProps {
    amazonCheckoutSessionId: string;
    amount: PaymentAmount;
    clientKey: string;
    chargePermissionType?: ChargePermissionType;
    onError: (error, component) => void;
    recurringMetadata: RecurringMetadata;
    ref: any;
    region: Region;
    returnUrl: string;
    publicKeyId: string;
}

export interface AmazonPayElementData {
    paymentMethod: {
        type: string;
        checkoutSessionId?: string;
    };
    browserInfo: BrowserInfo;
}

export interface AmazonPayButtonSettings {
    buttonColor?: ButtonColor;
    design?: string;
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
    productType: ProductType;

    /**
     * Placement of the Amazon Pay button on your website
     */
    placement: Placement;

    /**
     * Language used to render the button and text on Amazon Pay hosted pages. Please note that supported language(s) is dependent on the region that your Amazon Pay account was registered for
     */
    checkoutLanguage: SupportedLocale;

    /**
     * Ledger currency provided during registration for the given merchant identifier
     */
    ledgerCurrency: Currency;
}

interface MerchantMetadata {
    customInformation?: string;
    merchantReferenceId?: string;
    merchantStoreName?: string;
    noteToBuyer?: string;
}

interface AddressDetails {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    districtOrCounty?: string;
    stateOrRegion?: string;
    postalCode?: string;
    countryCode?: string;
    phoneNumber?: string;
}

export interface ChargeAmount {
    amount: string;
    currencyCode: Currency;
}

export type LedgerCurrencies = {
    [key in Region]: Currency;
};

export interface PayloadJSON {
    addressDetails?: AddressDetails;
    chargePermissionType?: ChargePermissionType;
    deliverySpecifications?: DeliverySpecifications;
    merchantMetadata?: MerchantMetadata;
    paymentDetails?: {
        chargeAmount: ChargeAmount;
        paymentIntent: 'Confirm';
        presentmentCurrency: Currency;
        totalOrderAmount: ChargeAmount;
    };
    recurringMetadata?: RecurringMetadata;
    storeId: string;
    webCheckoutDetails: {
        checkoutCancelUrl?: string;
        checkoutMode?: 'ProcessOrder';
        checkoutResultReturnUrl?: string;
        checkoutReviewReturnUrl?: string;
    };
}

export interface CheckoutDetailsRequest {
    checkoutSessionId: string;
    getDeliveryAddress?: boolean;
    getDeclineFlowUrl?: boolean;
    publicKeyId: string;
    region: Region;
}

export interface UpdateAmazonCheckoutSessionRequest {
    amount: PaymentAmount;
    chargePermissionType?: ChargePermissionType;
    checkoutCancelUrl?: string;
    checkoutResultReturnUrl: string;
    checkoutSessionId: string;
    publicKeyId: string;
    recurringMetadata?: RecurringMetadata;
    region: Region;
}

export interface CheckoutSessionConfig {
    payloadJSON: string;
    signature: string;
    publicKeyId: string;
}

export interface DeliverySpecifications {
    specialRestrictions?: string[];
    addressRestrictions?: AddressRestrictions;
}

interface AddressRestrictions {
    type?: 'Allowed' | 'NotAllowed';
    restrictions?: Restrictions;
}

interface Restrictions {
    [key: string]: {
        zipCodes?: string[];
        statesOrRegions?: string[];
    };
}
