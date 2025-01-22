import type { CoreConfiguration } from '../../core/types';
import type { UIElementProps } from '../internal/UIElement/types';

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
    defaultToggleState: boolean | undefined;
    termsAndConditionsLink: string | undefined;
    termsAndConditionsVersion: string | undefined;
    privacyPolicyLink: string | undefined;
}

export interface FastlaneOptions {
    intendedExperience: 'externalProcessorCustomConsent';
}

// TODO: TBD if this is needed
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

export interface FastlaneAuthenticatedCustomerResult {
    authenticationState: 'succeeded' | 'failed' | 'canceled' | 'not_found';
    profileData: FastlaneProfile;
}

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
    card: {
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
        customerId: string;
        email: string;
        tokenId: string;
        lastFour: string;
        brand: string;
    };
};

type FastlaneCardComponentConfiguration = {
    paymentType: 'card';
    configuration: {
        fastlaneConfiguration: FastlaneSignupConfiguration;
    };
};

export type FastlaneSignupConfiguration = FastlaneConsentRenderState & {
    fastlaneSessionId: string;
};

export type FastlanePaymentMethodConfiguration = FastlaneComponentConfiguration | FastlaneCardComponentConfiguration;

export interface FastlaneSDKConfiguration {
    clientKey: string;
    environment: CoreConfiguration['environment'];
    locale?: 'en-US' | 'es-US' | 'fr-RS' | 'zh-US';
}

export interface FastlaneConfiguration extends UIElementProps {
    tokenId: string;
    customerId: string;
    lastFour: string;
    brand: string;
    email: string;
    fastlaneSessionId: string;
    /**
     * Display the brand images inside the Drop-in payment method header
     * @internal
     */
    keepBrandsVisible?: boolean;
    /**
     * List of brands accepted by the component
     * @internal
     */
    brands?: string[];
    /**
     * Configuration returned by the backend
     * @internal
     */
    configuration?: {
        brands: string[];
    };
}
