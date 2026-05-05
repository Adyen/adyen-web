import { ComponentChildren, h } from 'preact';
import type { Ref } from 'preact';
import {
    CardAllValidData,
    CardAutoCompleteData,
    CardBinValueData,
    CardBrandData,
    CardConfigSuccessData,
    CardFieldValidData,
    CardFocusData,
    CardLoadData,
    CVCPolicyType,
    DatePolicyType,
    StylesObject
} from '../lib/types';
import { AddressData } from '../../../../types/global-types';
import { CardBrandsConfiguration, CardPlaceholders } from '../../../Card/types';
import Language from '../../../../language';
import { Resources } from '../../../../core/Context/Resources';
import { TouchStartEventObj } from '../../../Card/components/CardInput/components/types';
import { Placeholders as GiftcardPlaceholders } from '../../../Giftcard/components/types';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import type { SFFieldType } from '../lib/types';
import type { AbstractAnalyticsEvent } from '../../../../core/Analytics/events/AbstractAnalyticsEvent';
import type SecuredFieldsProvider from './SecuredFieldsProvider';
import { RefObject } from 'preact';

export type Placeholders = CardPlaceholders | GiftcardPlaceholders;

/**
 * Should be the only props that can be sent to SFP (from CardInput, SecuredFieldsInput, GiftcardComponent)
 */
export interface SFPProps {
    ref?: Ref<SecuredFieldsProvider>;
    autoFocus?: boolean;
    brands?: string[];
    brandsConfiguration?: CardBrandsConfiguration;
    clientKey: string;
    componentType: string;
    countryCode?: string;
    forceCompat?: boolean;
    hasKoreanFields?: boolean;
    i18n?: Language;
    implementationType?: 'components' | 'custom';
    keypadFix?: boolean;
    koreanAuthenticationRequired?: boolean;
    legacyInputMode?: boolean;
    loadingContext: string;
    minimumExpiryDate?: string;
    onAdditionalSFConfig?: () => void;
    onAdditionalSFRemoved?: () => void;
    onAllValid?: (obj: CardAllValidData) => void;
    onAutoComplete?: (obj: CardAutoCompleteData) => void;
    onBinValue?: (obj: CardBinValueData) => void;
    onBrand?: (obj: CardBrandData) => void;
    onChange?: (state: SFPState, eventDetails?: OnChangeEventDetails) => void;
    onConfigSuccess?: (cbObj: CardConfigSuccessData) => void;
    onError?: (error: AdyenCheckoutError) => void;
    onFieldValid?: (fieldObj: CardFieldValidData) => void;
    onFocus?: (obj: CardFocusData) => void;
    onLoad?: (cbObj: CardLoadData) => void;
    onStateUpdate?: (obj: SFPState) => void;
    onSubmitAnalytics?: (event: AbstractAnalyticsEvent) => void;
    handleKeyPress?: (obj: KeyboardEvent) => void;
    rootNode?: HTMLElement; // Specific to SecuredFieldsInput
    showWarnings?: boolean;
    styles?: StylesObject;
    trimTrailingSeparator?: boolean;
    type: string;
    render?: (helpers: { setRootNode: (input: HTMLElement) => void; setFocusOn: (fieldName: string) => void }, state: SFPState) => ComponentChildren;
    resources?: Resources;
    maskSecurityCode?: boolean;
    exposeExpiryDate?: boolean;
    disableIOSArrowKeys?: (obj: TouchStartEventObj) => void | null;
    placeholders?: Placeholders;
    showContextualElement?: boolean;
}

export type SFPErrorMap = Partial<Record<SFFieldType, string>>;

export interface SFPState {
    status?: string;
    brand?: string;
    errors?: SFPErrorMap;
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
}

export interface OnChangeEventDetails {
    event: string;
    fieldType?: string;
}

export type SecuredFieldsProviderRef = RefObject<SecuredFieldsProvider>;
