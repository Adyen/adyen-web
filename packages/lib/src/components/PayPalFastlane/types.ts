export type FastlaneConstructor = (options: FastlaneOptions) => Promise<Fastlane>;

/**
 * PayPal Fastlane Reference:
 * https://developer.paypal.com/docs/checkout/fastlane/reference/#link-customizeyourintegration
 */

// TODO: Verify if we pass options here
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FastlaneOptions {}

export interface Fastlane {
    identity: {
        lookupCustomerByEmail: (email: string) => Promise<{ customerContextId: string }>;
        triggerAuthenticationFlow: (customerContextId: string, options?: AuthenticationFlowOptions) => Promise<FastlaneAuthenticatedCustomerResult>;
    };
    profile: {
        showShippingAddressSelector: () => Promise<FastlaneShippingAddressSelectorResult>;
        showCardSelector: () => ShowCardSelectorResult;
    };
    setLocale: (locale: string) => void;
    FastlaneWatermarkComponent: (options: { includeAdditionalInfo: boolean }) => Promise<FastlaneWatermarkComponent>;
}

interface FastlaneWatermarkComponent {
    render: (container) => null;
}

// TODO: fill this in after workshop
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AuthenticationFlowOptions {}

/**
 * The AuthenticatedCustomerResult object type is returned from the identity.triggerAuthenticationFlow() call.
 */
interface FastlaneProfile {
    name: Name;
    shippingAddress: FastlaneShipping;
    card: PaymentToken;
}

interface Name {
    firstName: string;
    lastName: string;
    fullName: string;
}

interface Phone {
    nationalNumber: string;
    countryCode: string;
}

export interface FastlaneAddress {
    addressLine1: string;
    addressLine2: string;
    adminArea1: string;
    adminArea2: string;
    postalCode: string;
    countryCode: string;
    phone: Phone;
}

export interface FastlaneShipping {
    name: Name;
    address: FastlaneAddress;
    phoneNumber: Phone;
}

interface PaymentToken {
    id: string;
    paymentSource: PaymentSource;
}
interface PaymentSource {
    card: CardPaymentSource;
}

interface CardPaymentSource {
    brand: string;
    expiry: string;
    lastDigits: string;
    name: string;
    billingAddress: FastlaneAddress;
}

interface ShowCardSelectorResult {
    selectionChanged: boolean;
    selectedCard: PaymentToken;
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
