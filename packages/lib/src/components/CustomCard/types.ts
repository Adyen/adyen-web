import { CardConfiguration } from '../Card/types';

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
>;
