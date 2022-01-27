import { Language } from '../../../../language/Language';
import { CardBrandsConfiguration } from '../../../Card/types';
import { StylesObject } from '../lib/types';

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
    hasKoreanFields?: boolean;
    i18n: Language;
    implementationType?: string;
    isCollatingErrors?: boolean;
    keypadFix?: boolean;
    koreanAuthenticationRequired?: boolean;
    legacyInputMode?: boolean;
    loadingContext: string;
    minimumExpiryDate?: string;
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
    styles?: StylesObject;
    trimTrailingSeparator?: boolean;
    type: string;
    render: () => {};
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
    styles: {}
};
