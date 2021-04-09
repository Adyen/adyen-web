import { PaymentAmount } from '../../../../../types';

export interface BrandIconProps {
    brand: string;
}

export interface CardFieldsProps {
    brand?: string;
    dualBrandingChangeHandler?: any;
    dualBrandingElements?: any;
    dualBrandingSelected?: string;
    errors?: any;
    focusedElement?: any;
    hasCVC?: any;
    cvcPolicy?: string;
    hideDateForBrand?: any;
    onFocusField?: any;
    showBrandIcon?: boolean;
    valid?: any;
}

export interface CardHolderNameProps {
    error: boolean;
    isValid: boolean;
    onChange: (event: Event) => void;
    placeholder?: string;
    required?: boolean;
    value?: string;
}

export interface CardNumberProps {
    brand: string;
    dualBrandingChangeHandler?: any;
    dualBrandingElements?: any;
    dualBrandingSelected?: string;
    error: string;
    filled: boolean;
    focused: boolean;
    isValid: boolean;
    label: string;
    onFocusField: (field: string) => void;
    showBrandIcon: boolean;
}

export interface CVCProps {
    className?: string;
    classNameModifiers?: string[];
    error?: string;
    filled?: any;
    focused?: any;
    frontCVC?: boolean;
    cvcPolicy?: string;
    isValid?: any;
    label?: any;
    onFocusField: (field: string) => void;
}

export interface CVCHintProps {
    frontCVC: boolean;
}

export interface DualBrandingIconProps {
    brand: string;
    onClick?: any;
    dataValue?: string;
    notSelected?: boolean;
    onFocusField?: any;
}

export interface ExpirationDateProps {
    className?: string;
    error?: string;
    filled?: boolean;
    focused?: boolean;
    isValid?: boolean;
    label?: string;
    onFocusField: (fieldName: string) => {};
    hideDateForBrand?: boolean;
}

export interface InstallmentsProps {
    amount?: PaymentAmount;
    brand?: string;
    onChange?: (installmentObject: object) => void;
    installmentOptions: InstallmentOptions;
    type?: string;
}

export interface InstallmentOptions {
    [key: string]: {
        values: number[];
        plans?: string[];
        preselectedValue?: number;
    };
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
    onChange: (kcpData: object, kcpValid: object) => void;
    ref: any;
    taxNumber?: string;
}

export type RtnType_ParamBooleanFn = (tn) => boolean;
export type RtnType_ParamVoidFn = (e) => void;

export interface StoredCardFieldsProps {
    brand: string;
    errors: any;
    expiryMonth?: string;
    expiryYear?: string;
    focusedElement: string;
    hasCVC: boolean;
    cvcPolicy: string;
    lastFour?: string;
    onFocusField: any;
    valid: any;
    status: string;
}
