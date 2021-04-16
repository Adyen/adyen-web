import Language from '../../../../language/Language';
import { CardConfiguration, DualBrandSelectElement, SocialSecurityMode } from '../../types';
import { PaymentAmount } from '../../../../types';
import { InstallmentOptions } from './components/types';
import { ValidationResult } from '../../../internal/PersonalDetails/types';

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
    billingAddress?: object;
    socialSecurityNumber?: string;
    taxNumber?: string;
}

interface Placeholders {
    holderName?: string;
}

export interface CardInputProps {
    amount?: PaymentAmount;
    billingAddressAllowedCountries?: string[];
    billingAddressRequired?: boolean;
    billingAddressRequiredFields?: string[];
    brand?: string;
    configuration: CardConfiguration;
    countryCode: string;
    cvcPolicy?: string;
    data?: CardInputDataState;
    enableStoreDetails: boolean;
    fundingSource: string;
    hasCVC: boolean;
    hasHolderName: boolean;
    holderName?: string;
    holderNameRequired?: boolean;
    i18n?: Language;
    installmentOptions: InstallmentOptions;
    socialSecurityNumberMode?: SocialSecurityMode;
    loadingContext: string;
    onBlur: (e) => {};
    onFocus: (e) => {};
    payButton?: (obj) => {};
    placeholders?: Placeholders;
    positionHolderNameOnTop: boolean;
    showInstallmentAmounts: boolean;
    showPayButton?: boolean;
    storedPaymentMethodId?: string;
    styles?: object;
    type: string;
    onChange?: (state) => {};
    onSubmit?: () => {};
    onBrand?: () => {};
    onBinValue?: () => {};
}

export interface CardInputState {
    additionalSelectElements: DualBrandSelectElement[];
    additionalSelectValue: string;
    billingAddress: object;
    brand?: string;
    data?: object;
    errors?: object;
    focusedElement: string;
    cvcPolicy: string;
    hideDateForBrand: boolean;
    isValid: boolean;
    status: string;
    valid?: object;
    issuingCountryCode: string;
    showSocialSecurityNumber?: boolean;
}
