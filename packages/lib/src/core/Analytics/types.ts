import { PaymentAmount } from '../../types';
import { CoreOptions } from '../types';
import { SocialSecurityMode } from '../../components/Card/types';

export interface Experiment {
    controlGroup: boolean;
    experimentId: string;
    experimentName?: string;
}

export interface AnalyticsData {
    /**
     * Relates to PMs used within Plugins
     * https://docs.adyen.com/development-resources/application-information/?tab=integrator_built_2#application-information-fields
     * @internal
     */
    applicationInfo?: {
        externalPlatform: {
            name: string;
            version: string;
            integrator: string;
        };
        merchantApplication: {
            name: string;
            version: string;
        };
        merchantDevice?: {
            os: string;
            osVersion: string;
        };
    };

    /**
     * Use a checkoutAttemptId from a previous page
     */
    checkoutAttemptId?: string;
}

export interface AnalyticsOptions {
    /**
     * Enable/Disable all analytics
     */
    enabled?: boolean;

    /**
     * Enable/Disable telemetry data
     */
    telemetry?: boolean;

    /**
     * Data to be sent along with the event data
     */
    payload?: any;

    /**
     * List of experiments to be sent in the collectId call // TODO - still used?
     */
    experiments?: Experiment[];

    /**
     * A wrapper to pass data needed when analytics is setup
     */
    analyticsData?: AnalyticsData;
}

export type AnalyticsProps = Pick<CoreOptions, 'loadingContext' | 'locale' | 'clientKey' | 'analytics' | 'amount'> & { analyticsContext?: string };

export interface AnalyticsObject {
    timestamp: string;
    component: string;
    id: string;
    code?: string;
    errorType?: string;
    message?: string;
    type?: string;
    subtype?: string;
    target?: string;
    metadata?: Record<string, any>;
    isStoredPaymentMethod?: boolean;
    brand?: string;
    validationErrorCode?: string;
    validationErrorMessage?: string;
    issuer?: string;
    isExpress?: boolean;
    expressPage?: string;
    result?: string;
    configData?: any;
}

export type ANALYTICS_EVENT = 'log' | 'error' | 'info';

export type CreateAnalyticsObject = Omit<AnalyticsObject, 'timestamp' | 'id'> & { event: ANALYTICS_EVENT };

export type AnalyticsInitialEvent = {
    containerWidth: number;
    component: string;
    flavor: string;
    paymentMethods?: any[];
    sessionId?: string;
};

export type AnalyticsConfig = {
    analyticsContext?: string;
    clientKey?: string;
    locale?: string;
    amount?: PaymentAmount;
    loadingContext?: string;
};

export type CreateAnalyticsEventData = Omit<AnalyticsObject, 'timestamp' | 'id'>;

export type CreateAnalyticsEventObject = {
    event: ANALYTICS_EVENT;
    data: CreateAnalyticsEventData;
};

export type EventQueueProps = Pick<AnalyticsConfig, 'analyticsContext' | 'clientKey'> & { analyticsPath: string };

export type SendAnalyticsObject = Omit<AnalyticsObject, 'timestamp' | 'component' | 'id'>;

export type FieldErrorAnalyticsObject = {
    fieldType: string;
    errorCode: string;
};

export type ConfigData = CardConfigData; // TODO extend in future as we get Dropin & Checkout related config data

export type CardConfigData = {
    autoFocus: boolean;
    billingAddressAllowedCountries: string;
    billingAddressMode: 'full' | 'partial' | 'lookup' | 'none';
    billingAddressRequired: boolean;
    billingAddressRequiredFields: string;
    brands: string;
    challengeWindowSize: string;
    disableIOSArrowKeys: boolean;
    doBinLookup: boolean;
    enableStoreDetails: boolean;
    exposeExpiryDate: boolean;
    forceCompat: boolean;
    hasBrandsConfiguration: boolean;
    hasData: boolean;
    hasDisclaimerMessage: boolean;
    hasHolderName: boolean;
    hasPlaceholders: boolean;
    hasInstallmentOptions: boolean;
    hideCVC: boolean;
    holderNameRequired: boolean;
    hasStylesConfigured: boolean;
    keypadFix: boolean;
    legacyInputMode: boolean;
    maskSecurityCode: boolean;
    minimumExpiryDate: boolean;
    name: string;
    positionHolderNameOnTop: boolean;
    riskEnabled: boolean;
    showBrandIcon: boolean;
    showBrandsUnderCardNumber: boolean; // (v5 only)
    showInstallmentAmounts: boolean;
    showKCPType: 'none' | 'auto' | 'atStart';
    showPayButton: boolean;
    socialSecurityNumberMode: SocialSecurityMode;
    srPanelEnabled: boolean;
    srPanelMoveFocus: boolean;
    // callbacks
    hasOnAllValid: boolean;
    hasOnBinLookup: boolean;
    hasOnBinValue: boolean;
    hasOnBlur: boolean;
    hasOnBrand: boolean;
    hasOnConfigSuccess: boolean;
    hasOnFieldValid: boolean;
    hasOnFocus: boolean;
    hasOnLoad: boolean;
};
