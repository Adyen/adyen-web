import { PaymentAmount } from '../../types';
import { SocialSecurityMode } from '../../components/Card/types';
import { ANALYTICS_EVENT } from './constants';

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

export type AnalyticsProps = {
    clientKey: string;
    analyticsContext: string;
    locale: string;
    analytics?: AnalyticsOptions;
};

export type AnalyticsEventCategory = (typeof ANALYTICS_EVENT)[keyof typeof ANALYTICS_EVENT];

export type AnalyticsInitialEvent = {
    containerWidth?: number;
    component?: string;
    flavor?: string;
    paymentMethods?: any[];
    sessionId?: string;
    checkoutStage?: 'precheckout' | 'checkout';
};

export type AnalyticsConfig = {
    analyticsContext?: string;
    clientKey?: string;
    locale?: string;
    amount?: PaymentAmount;
    loadingContext?: string;
};

export interface AnalyticsObject {
    timestamp: string;
    id: string;
    component: string;
    code?: string;
    errorType?: string;
    message?: string;
    type?: string;
    subType?: string;
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
    configData?: Record<string, string | boolean>;
}

export type EventQueueProps = Pick<AnalyticsConfig, 'analyticsContext' | 'clientKey'> & { analyticsPath: string };

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
    showInstallmentAmounts: boolean;
    showKCPType: 'none' | 'auto' | 'atStart';
    showPayButton: boolean;
    socialSecurityNumberMode: SocialSecurityMode;
    srPanelEnabled: boolean;
    srPanelMoveFocus: boolean;
    trimTrailingSeparator: boolean;
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
    hasOnEnterKeyPressed: boolean;
    /**
     * Fastlane
     */
    hasFastlaneConfigured?: boolean;
    isFastlaneConsentDefaultOn?: boolean;
};
