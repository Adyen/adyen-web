import { BrandConfiguration, CardBrandsConfiguration, DualBrandSelectElement, DualBrandingChangeHandler } from '../../../types';
import { ComponentChildren } from 'preact';
import { CVCPolicyType, DatePolicyType } from '../../../../internal/SecuredFields/lib/types';
import { SFPErrorMap, SFPValid } from '../../../../internal/SecuredFields/SFP/types';

export interface BrandIconProps {
    brand: string;
    brandsConfiguration?: CardBrandsConfiguration;
}

export interface CardFieldsProps {
    brand: string;
    brandsIcons?: Array<BrandConfiguration>;
    brandsConfiguration?: CardBrandsConfiguration;
    dualBrandingChangeHandler: DualBrandingChangeHandler;
    dualBrandingElements?: DualBrandSelectElement[];
    selectedBrandValue: string;
    errors?: any;
    focusedElement?: any;
    hasCVC?: any;
    cvcPolicy?: CVCPolicyType;
    expiryDatePolicy?: DatePolicyType;
    onFocusField?: (field: string) => void;
    showBrandIcon?: boolean;
    valid: SFPValid;
    showContextualElement?: boolean;
}

export interface CardHolderNameProps {
    error: boolean;
    isValid: boolean;
    onBlur: (event: Event) => void;
    onInput: (event: Event) => void;
    placeholder?: string;
    required?: boolean;
    value?: string;
    disabled?: boolean;
    onFieldFocusAnalytics?: (who: string, event: Event) => void;
    onFieldBlurAnalytics?: (who: string, event: Event) => void;
}

export interface CardNumberProps {
    brand: string;
    brandsConfiguration?: CardBrandsConfiguration;
    dualBrandingChangeHandler: DualBrandingChangeHandler;
    dualBrandingElements?: DualBrandSelectElement[];
    selectedBrandValue: string;
    error: string;
    filled: boolean;
    focused: boolean;
    isValid: boolean;
    label: string;
    onFocusField: (field: string) => void;
    showBrandIcon?: boolean;
}

export interface CVCProps {
    className?: string;
    classNameModifiers?: string[];
    error?: string;
    filled?: boolean;
    focused?: boolean;
    frontCVC?: boolean;
    cvcPolicy?: CVCPolicyType;
    isValid?: boolean;
    label?: string;
    onFocusField: (field: string) => void;
    showContextualElement?: boolean;
    contextualText?: string;
}

export interface CVCHintProps {
    fieldLabel: string;
    frontCVC: boolean;
    onClick?: () => void;
}

export interface ExpirationDateProps {
    className?: string;
    classNameModifiers?: string[];
    error?: string;
    filled?: boolean;
    focused?: boolean;
    isValid?: boolean;
    label?: string;
    onFocusField: (field: string) => void;
    expiryDatePolicy?: DatePolicyType;
    showContextualElement?: boolean;
    contextualText?: string;
}

export interface InstallmentsItem {
    id: number;
    name: string;
}

export interface KCPErrors {
    taxNumber: boolean | string;
}

export interface KCPProps {
    encryptedPasswordState: {
        data: string;
        valid: boolean;
        errors: boolean | string;
    };
    filled?: boolean;
    focusedElement;
    onFocusField: (str: string) => {};
    onBlur: (event: Event) => void;
    onInput: (event: Event) => void;
    // taxNumber?: string;
    error: boolean;
    isValid: boolean;
    value: string;
    disabled?: boolean;
    placeholder?: string;
    onFieldFocusAnalytics?: (who: string, event: Event) => void;
    onFieldBlurAnalytics?: (who: string, event: Event) => void;
}

export type RtnType_ParamBooleanFn = (tn) => boolean;
export type RtnType_ParamVoidFn = (e) => void;

export interface StoredCardFieldsProps {
    brand: string;
    errors: SFPErrorMap;
    expiryMonth?: string;
    expiryYear?: string;
    focusedElement: string;
    hasCVC: boolean;
    cvcPolicy: CVCPolicyType;
    lastFour?: string;
    onFocusField: (field: string) => void;
    valid: SFPValid;
    status?: string;
    showContextualElement?: boolean;
}

export interface SfSpanProps {
    encryptedFieldType: string;
    className: string;
    uniqueId?: string; // not optional - but added in DataSfSpan comp rather than passed to it
    children?: ComponentChildren; // as above
    ['data-info']?: string; // optional
}

export interface TouchStartEventObj {
    fieldType: string;
    name?: string;
}
