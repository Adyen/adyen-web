import Language from '../../../../language/Language';
import { CardConfiguration, DualBrandSelectElement, SocialSecurityMode } from '../../types';
import { PaymentAmount } from '../../../../types';
import { InstallmentOptions } from './components/types';

export interface CardInputStateValid {
    holderName?: boolean;
    billingAddress?: boolean; // TODO check
    socialSecurityNumber?: boolean; // TODO check
    encryptedCardNumber?: boolean;
    encryptedExpiryMonth?: boolean;
    encryptedExpiryYear?: boolean;
    encryptedSecurityCode?: boolean;
    taxNumber?: boolean;
    encryptedPassword?: boolean;
}

export interface CardInputStateError {
    holderName?: boolean;
    billingAddress?: boolean;
    socialSecurityNumber?: boolean;
    encryptedCardNumber?: boolean;
    encryptedExpiryDate?: boolean;
    encryptedSecurityCode?: boolean;
    // taxNumber?: string;
    // encryptedPassword?: string;
}

export interface CardInputStateData {
    holderName?: string;
    billingAddress?: string;
    socialSecurityNumber?: string;
    encryptedCardNumber?: string;
    encryptedExpiryDate?: string;
    encryptedSecurityCode?: string;
    taxNumber?: string;
    encryptedPassword?: string;
}

interface Placeholders {
    holderName?: string;
}

export interface CardInputProps {
    amount?: PaymentAmount; // new type
    billingAddressAllowedCountries?: string[];
    billingAddressRequired?: boolean;
    billingAddressRequiredFields?: string[];
    brand?: string;
    configuration: CardConfiguration;
    countryCode: string;
    cvcPolicy?: string; // new
    data?: CardInputStateData; // new type
    enableStoreDetails: boolean;
    fundingSource: string; // new
    hasCVC: boolean;
    hasHolderName: boolean;
    holderName?: string; // new type
    holderNameRequired?: boolean;
    i18n?: Language;
    installmentOptions: InstallmentOptions; // new type
    socialSecurityNumberMode?: SocialSecurityMode;
    loadingContext: string;
    onBlur: (e) => {}; // new
    onFocus: (e) => {}; // new
    payButton?: (obj) => {};
    placeholders?: Placeholders;
    positionHolderNameOnTop: boolean;
    showInstallmentAmounts: boolean;
    showPayButton?: boolean;
    storedPaymentMethodId?: string;
    styles?: object;
    type: string; // new
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
