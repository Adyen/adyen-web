import Language from '../../../../language/Language';
import { BinLookupResponse, CardBrandsConfiguration, CardConfiguration, DualBrandSelectElement, SocialSecurityMode } from '../../types';
import { PaymentAmount } from '../../../../types';
import { InstallmentOptions } from './components/types';
import { ValidationResult } from '../../../internal/PersonalDetails/types';
import { CVCPolicyType, DatePolicyType } from '../../../internal/SecuredFields/lib/core/AbstractSecuredField';
import { ValidationRuleResult } from '../../../../utils/Validator/Validator';
import Specifications from '../../../internal/Address/Specifications';
import { AddressSchema, StringObject } from '../../../internal/Address/types';
import { CbObjOnError, StylesObject } from '../../../internal/SecuredFields/lib/types';

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
    brandsConfiguration?: CardBrandsConfiguration;
    configuration?: CardConfiguration;
    countryCode?: string;
    cvcPolicy?: CVCPolicyType;
    data?: CardInputDataState;
    enableStoreDetails?: boolean;
    fundingSource?: string;
    hasCVC?: boolean;
    hasHolderName?: boolean;
    holderName?: string;
    holderNameRequired?: boolean;
    i18n?: Language;
    installmentOptions?: InstallmentOptions;
    socialSecurityNumberMode?: SocialSecurityMode;
    loadingContext?: string;
    onBlur?: (e) => {};
    onFocus?: (e) => {};
    payButton?: (obj) => {};
    placeholders?: Placeholders;
    positionHolderNameOnTop?: boolean;
    showInstallmentAmounts?: boolean;
    showPayButton?: boolean;
    storedPaymentMethodId?: string;
    styles?: object;
    type?: string;
    onChange?: (state) => {};
    onSubmit?: () => {};
    onBrand?: () => {};
    onBinValue?: () => {};
    details?: object;
    storedDetails?: object;
    SRConfig?: ScreenreaderConfig;
    specifications?: Specifications;
    setComponentRef: (ref) => void;
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

export interface CardInputRef {
    sfp?: any;
    setFocusOn?: (who) => void;
    showValidation?: (who) => void;
    processBinLookupResponse?: (binLookupResponse: BinLookupResponse, isReset: boolean) => void;
    setStatus?: any;
    updateStyles?: (stylesObj: StylesObject) => void;
    handleUnsupportedCard?: (errObj: CbObjOnError) => boolean;
}

interface ScreenreaderConfig {
    collateErrors?: boolean;
    moveFocus?: boolean;
    showPanel?: boolean;
}

interface FieldError {
    errorMessage?: string;
    errorI18n?: string;
}

export interface ErrorObj {
    holderName?: ValidationRuleResult;
    socialSecurityNumber?: ValidationRuleResult;
    taxNumber?: ValidationRuleResult;
    billingAddress?: ValidationRuleResult;
    encryptedCardNumber?: FieldError;
    encryptedExpiryDate?: FieldError;
    encryptedSecurityCode?: FieldError;
    encryptedBankAccountNumber?: FieldError;
    encryptedBankLocationId?: FieldError;
    encryptedPassword?: FieldError;
    encryptedPin?: FieldError;
}

export interface LayoutObj {
    props: CardInputProps;
    showKCP: boolean;
    showBrazilianSSN: boolean;
    countrySpecificSchemas: AddressSchema;
}

export interface SortErrorsObj {
    errors: ErrorObj;
    layout: string[];
    i18n: Language;
    countrySpecificLabels: StringObject;
}
