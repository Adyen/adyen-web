import { CardConfiguration } from '../Card/types';
import { SFError } from '../Card/components/CardInput/types';
import UIElement from '../internal/UIElement';

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
    onEnterKeyPressed?: (activeElement: Element, component: UIElement) => void;
};

export type ValidationError = SFError & {
    fieldType: string;
};
