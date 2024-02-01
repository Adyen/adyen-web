import { CardConfiguration } from '../Card/types';
import { SFError } from '../Card/components/CardInput/types';

export type CustomCardConfiguration = Omit<
    CardConfiguration,
    | 'clickToPayConfiguration'
    | '_disableClickToPay'
    | 'fundingSource'
    | 'showBrandsUnderCardNumber'
    | 'positionHolderNameOnTop'
    | 'showBrandIcon'
    | 'showFormInstruction'
    | 'enableStoreDetails'
    | 'hideCVC'
    | 'hasCVC'
    | 'hasHolderName'
    | 'holderNameRequired'
    | 'billingAddressRequired'
    | 'billingAddressRequiredFields'
    | 'billingAddressAllowedCountries'
    | 'installmentOptions'
    | 'showInstallmentAmounts'
    | 'configuration'
> & {
    onValidationError?: (validationErrors: ValidationError[]) => void;
};

export type ValidationError = SFError & {
    fieldType: string;
};
