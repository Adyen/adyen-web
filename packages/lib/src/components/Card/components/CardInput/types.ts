import Language from '../../../../language/Language';
import { CardConfiguration, DualBrandSelectElement } from '../../types';

export interface CardInputProps {
    amount?: object;
    billingAddressAllowedCountries?: string[];
    billingAddressRequired?: boolean;
    billingAddressRequiredFields?: string[];
    brand?: string;
    configuration?: CardConfiguration;
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
    positionHolderNameOnTop: boolean;
    showInstallmentAmounts: boolean;
    showPayButton?: boolean;
    storedPaymentMethodId?: string;
    styles?: object;
    onChange?: () => {};
    onSubmit?: () => {};
    onBrand?: () => {};
    onBinValue?: () => {};
}

export interface CardInputState {
    additionalSelectElements: DualBrandSelectElement[];
    additionalSelectValue: string;
    billingAddress: object;
    data?: object;
    errors?: object;
    focusedElement: string;
    cvcPolicy: string;
    hideDateForBrand: boolean;
    isValid: boolean;
    status: string;
    valid?: object;
    issuingCountryCode: string;
}
