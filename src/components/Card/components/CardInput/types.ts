import Language from '../../../../language/Language';

export interface CardInputProps {
    amount?: object;
    billingAddressAllowedCountries?: string[];
    billingAddressRequired?: boolean;
    billingAddressRequiredFields?: string[];
    brand?: string;
    data?: object;
    enableStoreDetails: boolean;
    hasCVC: boolean;
    hasHolderName: boolean;
    holderName?: boolean;
    holderNameRequired?: boolean;
    i18n?: Language;
    installmentOptions: object;
    koreanAuthenticationRequired?: boolean;
    loadingContext: string;
    payButton?: () => {};
    placeholders?: object;
    showPayButton?: boolean;
    storedPaymentMethodId?: string;
    styles?: object;
    onChange?: () => {};
    onSubmit?: () => {};
    onBrand?: () => {};
    onBinValue?: () => {};
}

export interface CardInputState {
    additionalSelectElements: any[];
    additionalSelectType: string;
    additionalSelectValue: string;
    billingAddress: object;
    data?: object;
    errors?: object;
    focusedElement: string;
    hideCVCForBrand: boolean;
    isValid: boolean;
    status: string;
    valid?: object;
}

export interface BinValueObject {
    detectedBrands: string[];
    issuingCountryCode: string;
    requestId: string;
    supportedBrands: string[];
}
