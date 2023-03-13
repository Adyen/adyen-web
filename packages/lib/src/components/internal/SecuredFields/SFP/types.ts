import { CVCPolicyType, DatePolicyType, StylesObject } from '../lib/types';
import { AddressData } from '../../../../types';
import { CardBrandsConfiguration } from '../../../Card/types';
import { Language } from '../../../../language/Language';
import { TouchStartEventObj } from '../../../Card/components/CardInput/components/types';

/**
 * Should be the only props that can be sent to SFP (from CardInput, SecuredFieldsInput, AchInput, GiftcardComponent)
 */
export interface SFPProps {
    allowedDOMAccess?: boolean;
    autoFocus?: boolean;
    brands?: string[];
    brandsConfiguration?: CardBrandsConfiguration;
    clientKey: string;
    countryCode?: string;
    forceCompat?: boolean;
    hasKoreanFields?: boolean;
    i18n: Language;
    implementationType?: string;
    isCollatingErrors?: boolean;
    keypadFix?: boolean;
    koreanAuthenticationRequired?: boolean;
    legacyInputMode?: boolean;
    loadingContext: string;
    minimumExpiryDate?: string;
    onAdditionalSFConfig?: () => {};
    onAdditionalSFRemoved?: () => {};
    onAllValid?: () => {};
    onAutoComplete?: () => {};
    onBinValue?: () => {};
    onBrand?: () => {};
    onChange: () => {};
    onConfigSuccess?: () => {};
    onError?: () => {};
    onFieldValid?: () => {};
    onFocus?: () => {};
    onLoad?: () => {};
    rootNode: HTMLElement; // Specific to SecuredFieldsInput
    showWarnings?: boolean;
    styles?: StylesObject;
    trimTrailingSeparator?: boolean;
    type: string;
    render: () => {};
    maskSecurityCode: boolean;
    disableIOSArrowKeys: (obj: TouchStartEventObj) => void | null;
}

export interface SFPState {
    status?: string;
    brand?: string;
    errors?: object;
    valid: SFPValid;
    data: object;
    cvcPolicy?: CVCPolicyType;
    isSfpValid?: boolean;
    autoCompleteName?: string;
    billingAddress?: AddressData;
    detectedUnsupportedBrands?: string[];
    hasKoreanFields?: boolean;
    showSocialSecurityNumber?: boolean;
    expiryDatePolicy?: DatePolicyType;
    socialSecurityNumber?: string;
}

export interface SingleBrandResetObject {
    brand: string;
    cvcPolicy: CVCPolicyType;
}

export interface SFPValid {
    encryptedCardNumber?: boolean;
    encryptedExpiryMonth?: boolean;
    encryptedExpiryYear?: boolean;
    encryptedSecurityCode?: boolean;
    encryptedPassword?: boolean;
    encryptedPin?: boolean;
    encryptedBankAccountNumber?: boolean;
    encryptedBankLocationId?: boolean;
}

export interface OnChangeEventDetails {
    event: string;
    fieldType?: string;
}
