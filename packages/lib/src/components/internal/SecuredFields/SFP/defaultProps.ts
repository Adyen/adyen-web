import { Language } from '../../../../language/Language';
// import { CVCPolicyType } from '../lib/types';
import { CardBrandsConfiguration } from '../../../Card/types';

/**
 * Should be the only props that can be sent to SFP (from CardInput, SecuredFieldsInput, AchInput, GiftcardComponent)
 */
export interface SFPProps {
    allowedDOMAccess?: boolean;
    autoFocus?: boolean;
    brands?: string[];
    brandsConfiguration?: CardBrandsConfiguration;
    clientKey: string;
    countryCode: string;
    hasKoreanFields: boolean;
    i18n: Language;
    implementationType?: string;
    isCollatingErrors?: boolean;
    keypadFix?: boolean;
    koreanAuthenticationRequired: boolean;
    legacyInputMode: boolean;
    loadingContext: string;
    minimumExpiryDate: string;
    onAllValid?: () => {};
    onAdditionalSFConfig?: () => {};
    onAdditionalSFRemoved?: () => {};
    onAutoComplete?: () => {};
    onBinValue?: () => {};
    onBrand?: () => {};
    onChange: () => {};
    onConfigSuccess?: () => {};
    onError?: () => {};
    onFieldValid?: () => {};
    onFocus?: () => {};
    onLoad?: () => {};
    rootNode: HTMLElement;
    showWarnings?: boolean;
    styles?: object;
    trimTrailingSeparator?: boolean;
    type: string;
    render: () => {};

    /**
     * CSF RELATED (±22)
     */
    // brands?: string[];
    // placeholders?: object;

    /**
     * SFP RELATED (6)
     */

    /**
     * RELATED TO COMPS HIGHER UP THE RENDER CHAIN - Card, CardInput etc (±39)
     */
    // amount: object;
    // billingAddressAllowedCountries: string[];
    // billingAddressRequired: boolean;
    // billingAddressRequiredFields: string[];
    // brand: string;
    // createFromAction: () => {};
    // cvcPolicy: CVCPolicyType;
    // data: object;
    // details: object[];
    // enableStoreDetails: boolean;
    // environment: string;
    // expiryMonth: string; // one-click card
    // expiryYear: string; // one-click card
    // hasCVC: boolean;
    // hasHolderName: boolean;
    // hideCVC: boolean;
    // holderName: string;
    // holderNameRequired: boolean;
    // hasStoreDetails: boolean;
    // id: string; // one-click card
    // installmentOptions: object;
    // lastFour: string; // one-click card
    // locale: string;
    // modules: object;
    // name: string;
    // onAdditionalDetails: () => {};
    // onBlur: () => {};
    // onSubmit: () => {};
    // payButton: () => {};
    // paymentMethods: object[];
    // paymentMethodsResponse: object;
    // risk: object; // custom card comp
    // showBrandIcon: boolean;
    // showPayButton: boolean;
    // storedDetails: boolean;
    // storedPaymentMethodId: string; // one-click card
    // storedPaymentMethods: object[];
    // supportedShopperInteractions: string[]; // one-click card
}

export default {
    type: 'card',

    // Settings
    keypadFix: true,
    rootNode: null,
    loadingContext: null,
    brands: [],
    allowedDOMAccess: false,
    showWarnings: false,
    autoFocus: true,
    trimTrailingSeparator: true,

    // Events
    onChange: () => {},
    onLoad: () => {},
    onConfigSuccess: () => {},
    onAllValid: () => {},
    onFieldValid: () => {},
    onBrand: () => {},
    onError: () => {},
    onBinValue: () => {},
    onFocus: () => {},
    onAutoComplete: () => {},

    // Customization
    // placeholders: {},
    styles: {}
};
