import type { CoreConfiguration } from '../../core/types';
import type { UIElementProps } from '../internal/UIElement/types';
import { AnalyticsOptions } from '../../core/Analytics/types';

/**
 * PayPal Fastlane Reference:
 * https://developer.paypal.com/docs/checkout/fastlane/reference/#link-customizeyourintegration
 */

/**
 * Fastlane object available in the window
 */
export interface FastlaneWindowInstance {
    identity: {
        lookupCustomerByEmail: (email: string) => Promise<{ customerContextId: string }>;
        triggerAuthenticationFlow: (customerContextId: string, options?: AuthenticationFlowOptions) => Promise<FastlaneAuthenticatedCustomerResult>;
        getSession: () => Promise<{ sessionId: string }>;
    };
    profile: {
        showShippingAddressSelector: () => Promise<FastlaneShippingAddressSelectorResult>;
    };
    setLocale: (locale: string) => void;
    ConsentComponent: () => Promise<{
        getRenderState: () => Promise<FastlaneConsentRenderState>;
    }>;
    FastlaneWatermarkComponent: (options: { includeAdditionalInfo: boolean }) => Promise<{
        render: (container) => null;
    }>;
}

export interface FastlaneConsentRenderState {
    showConsent: boolean;
    defaultToggleState?: boolean;
    termsAndConditionsLink?: string;
    termsAndConditionsVersion?: string;
    privacyPolicyLink?: string;
}

export interface FastlaneOptions {
    intendedExperience: 'externalProcessorCustomConsent';
    metadata?: {
        geoLocOverride?: string;
    };
}

interface AuthenticationFlowOptions {}

interface CardPaymentSource {
    brand: string;
    expiry: string;
    lastDigits: string;
    name: string;
    billingAddress: FastlaneAddress;
}

/**
 * External types
 */
export interface FastlaneShippingAddressSelectorResult {
    selectionChanged: boolean;
    selectedAddress: FastlaneShipping;
}

interface FastlaneAuthenticatedCustomerSucceeded {
    authenticationState: 'succeeded';
    profileData: FastlaneProfile;
}

interface FastlaneAuthenticatedCustomerFailed {
    authenticationState: 'failed' | 'canceled' | 'not_found';
    profileData: undefined;
}

export type FastlaneAuthenticatedCustomerResult = FastlaneAuthenticatedCustomerSucceeded | FastlaneAuthenticatedCustomerFailed;

export interface FastlaneAddress {
    addressLine1: string;
    addressLine2: string;
    adminArea1: string;
    adminArea2: string;
    postalCode: string;
    countryCode: string;
    phone: {
        nationalNumber: string;
        countryCode: string;
    };
}

export interface FastlaneShipping {
    name: {
        firstName: string;
        lastName: string;
        fullName: string;
    };
    address: FastlaneAddress;
    phoneNumber: {
        nationalNumber: string;
        countryCode: string;
    };
}

export interface FastlaneProfile {
    name: {
        firstName: string;
        lastName: string;
        fullName: string;
    };
    shippingAddress: FastlaneShipping;
    card?: {
        id: string;
        paymentSource: {
            card: CardPaymentSource;
        };
    };
}

type FastlaneComponentConfiguration = {
    paymentType: 'fastlane';
    configuration: {
        fastlaneSessionId: string;
        email: string;
        tokenId: string;
        lastFour: string;
        brand: string;
    };
};

type FastlaneCardComponentConfiguration = {
    paymentType: 'card';
    configuration: {
        fastlaneConfiguration?: FastlaneSignupConfiguration;
    };
};

export type FastlaneSignupConfiguration = FastlaneConsentRenderState & {
    fastlaneSessionId?: string;
    telephoneNumber?: string;
};

export type FastlanePaymentMethodConfiguration = FastlaneComponentConfiguration | FastlaneCardComponentConfiguration;

export interface FastlaneSDKConfiguration {
    clientKey: string;
    environment: CoreConfiguration['environment'];
    locale?: 'en-US' | 'es-US' | 'fr-RS' | 'zh-US';
    analytics?: Pick<AnalyticsOptions, 'enabled'>;
    /**
     * Used to force the Fastlane SDK to return the consent details in case the shopper is not recognized.
     * Use-case: Developer is testing the flow in another country outside US, which would not get consent details.
     *
     * This configuration should not be used for 'live' environment
     */
    forceConsentDetails?: boolean;
}

export interface FastlaneConfiguration extends UIElementProps {
    /**
     * Card token ID, used to process the payment
     */
    tokenId: string;
    /**
     * Fastlane session ID
     */
    fastlaneSessionId: string;
    /**
     * Initial last four digits displayed once the Component is rendered
     */
    lastFour: string;
    /**
     * Initial brand displayed once the Component is rendered
     */
    brand: string;
    /**
     * Shopper's email (it will be used in the future to re-authenticate using Fastlane SDK within the Component)
     */
    email: string;
    /**
     * Used internally by Drop-in. Displays the brand images inside the Drop-in payment method header
     * @internal
     */
    keepBrandsVisible?: boolean;
    /**
     * Property returned by the backend. Contains the list of brands supported by Fastlane component
     * @internal
     */
    brands?: string[];
}
