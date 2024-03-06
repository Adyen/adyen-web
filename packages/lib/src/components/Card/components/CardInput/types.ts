import Language from '../../../../language/Language';
import { BinLookupResponse, BrandConfiguration, CardBrandsConfiguration, CardConfiguration, DualBrandSelectElement } from '../../types';
import { AddressData, PaymentAmount } from '../../../../types';
import { InstallmentOptions } from './components/types';
import { ValidationResult } from '../../../internal/PersonalDetails/types';
import { CVCPolicyType, DatePolicyType } from '../../../internal/SecuredFields/lib/types';
import Specifications from '../../../internal/Address/Specifications';
import { AddressSchema } from '../../../internal/Address/types';
import { CbObjOnError, StylesObject } from '../../../internal/SecuredFields/lib/types';
import { Resources } from '../../../../core/Context/Resources';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import Analytics from '../../../../core/Analytics';
import RiskElement from '../../../../core/RiskModule';
import { ComponentMethodsRef } from '../../../types';
import { DisclaimerMsgObject } from '../../../internal/DisclaimerMessage/DisclaimerMessage';
import { OnAddressLookupType, OnAddressSelectedType } from '../../../internal/Address/components/AddressSearch';

export interface CardInputValidState {
    holderName?: boolean;
    billingAddress?: boolean;
    socialSecurityNumber?: boolean;
    encryptedCardNumber?: boolean;
    encryptedExpiryMonth?: boolean;
    encryptedExpiryYear?: boolean;
    encryptedSecurityCode?: boolean;
    taxNumber?: boolean;
    encryptedPassword?: boolean;
}

export interface CardInputErrorState {
    holderName?: ValidationResult;
    billingAddress?: ValidationResult;
    socialSecurityNumber?: ValidationResult;
    encryptedCardNumber?: boolean;
    encryptedExpiryDate?: boolean;
    encryptedSecurityCode?: boolean;
    taxNumber?: ValidationResult;
    encryptedPassword?: boolean;
}

export interface CardInputDataState {
    holderName?: string;
    billingAddress?: AddressData;
    socialSecurityNumber?: string;
    taxNumber?: string;
}

type Placeholders = {
    holderName?: string;
};

/**
 * Should be the subset of the props sent to CardInput that are *actually* used by CardInput
 * - either in the comp itself or are passed on to its children
 */
export interface CardInputProps {
    amount?: PaymentAmount;
    isPayButtonPrimaryVariant?: boolean;
    allowedDOMAccess?: boolean;
    autoFocus?: boolean;
    billingAddressAllowedCountries?: string[];
    billingAddressRequired?: boolean;
    billingAddressRequiredFields?: string[];
    billingAddressMode?: AddressModeOptions;
    brand?: string;
    brands?: string[];
    brandsConfiguration?: CardBrandsConfiguration;
    brandsIcons: Array<BrandConfiguration>;
    clientKey: string;
    configuration?: CardConfiguration;
    countryCode?: string;
    cvcPolicy?: CVCPolicyType;
    data?: CardInputDataState;
    disableIOSArrowKeys?: boolean;
    enableStoreDetails?: boolean;
    expiryMonth?: string;
    expiryYear?: string;
    forceCompat?: boolean;
    fundingSource?: 'debit' | 'credit';
    hasCVC?: boolean;
    hasHolderName?: boolean;
    holderNameRequired?: boolean;
    i18n?: Language;
    implementationType?: string;
    installmentOptions?: InstallmentOptions;
    keypadFix?: boolean;
    lastFour?: string;
    loadingContext: string;
    legacyInputMode?: boolean;
    minimumExpiryDate?: string;
    modules?: {
        srPanel: SRPanel;
        analytics: Analytics;
        risk: RiskElement;
        resources: Resources;
    };
    onAdditionalSFConfig?: () => {};
    onAdditionalSFRemoved?: () => {};
    onAllValid?: () => {};
    onAutoComplete?: () => {};
    onBinValue?: () => {};
    onBlur?: (e) => {};
    onBrand?: () => {};
    onConfigSuccess?: () => {};
    onChange?: (state) => {};
    onError?: () => {};
    onFieldValid?: () => {};
    onFocus?: (e) => {};
    onLoad?: () => {};
    onAddressLookup?: OnAddressLookupType;
    onAddressSelected?: OnAddressSelectedType;
    addressSearchDebounceMs?: number;
    payButton?: (obj) => {};
    placeholders?: Placeholders;
    positionHolderNameOnTop?: boolean;
    resources: Resources;
    setComponentRef?: (ref) => void;
    showBrandsUnderCardNumber: boolean;
    showBrandIcon?: boolean;
    showFormInstruction?: boolean;
    showInstallmentAmounts?: boolean;
    showPayButton?: boolean;
    showStoreDetailsCheckbox?: boolean;
    showWarnings?: boolean;
    specifications?: Specifications;
    storedPaymentMethodId?: string;
    styles?: StylesObject;
    trimTrailingSeparator?: boolean;
    type?: string;
    maskSecurityCode?: boolean;
    disclaimerMessage?: DisclaimerMsgObject;
}

export interface CardInputState {
    dualBrandSelectElements: DualBrandSelectElement[];
    selectedBrandValue: string;
    billingAddress: object;
    brand?: string;
    data?: object;
    errors?: object;
    focusedElement: string;
    cvcPolicy: CVCPolicyType;
    expiryDatePolicy: DatePolicyType;
    isValid: boolean;
    status: string;
    valid?: object;
    issuingCountryCode: string;
    showSocialSecurityNumber?: boolean;
}

// An interface for the members exposed by CardInput to its parent Card/UIElement
export interface CardInputRef extends ComponentMethodsRef {
    sfp?: any;
    setFocusOn?: (who) => void;
    processBinLookupResponse?: (binLookupResponse: BinLookupResponse, isReset: boolean) => void;
    updateStyles?: (stylesObj: StylesObject) => void;
    handleUnsupportedCard?: (errObj: CbObjOnError) => boolean;
}

export interface FieldError {
    errorMessage?: string;
    errorI18n?: string;
}

export interface SFError {
    isValid: boolean;
    errorMessage: string;
    errorI18n: string;
    error: string;
    rootNode: HTMLElement;
    detectedBrands?: string[];
}

export interface SFStateErrorObj {
    [key: string]: SFError;
}

export interface LayoutObj {
    props: CardInputProps;
    showKCP: boolean;
    showBrazilianSSN: boolean;
    countrySpecificSchemas: AddressSchema;
    billingAddressRequiredFields?: string[];
}

export enum AddressModeOptions {
    full = 'full',
    partial = 'partial',
    none = 'none'
}
