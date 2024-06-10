import { CardConfiguration } from '../Card/types';
import { SFError } from '../Card/components/CardInput/types';
import { CbObjOnEnterKey } from '../internal/SecuredFields/lib/types';

export type CustomCardConfiguration = Omit<
    CardConfiguration,
    | 'clickToPayConfiguration'
    | '_disableClickToPay'
    | 'fundingSource'
    | 'positionHolderNameOnTop'
    | 'showBrandIcon'
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
    onEnterKeyPressed?: (o: CbObjOnEnterKey) => void;
};

export type ValidationError = SFError & {
    fieldType: string;
};
