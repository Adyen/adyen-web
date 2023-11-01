import Language from '../../language/Language';
import { AddressData } from '../../types/global-types';

export interface BoletoElementProps {
    type: string;
    i18n: Language;
    loadingContext: string;
    reference?: string;
}

export interface BoletoInputDataState {
    firstName?: string;
    lastName?: string;
    shopperEmail?: string;
    socialSecurityNumber?: string;
    billingAddress?: AddressData;
}

export interface BoletoInputValidState {
    firstName?: boolean;
    lastName?: boolean;
    shopperEmail?: boolean;
    socialSecurityNumber?: boolean;
    billingAddress?: boolean;
}

export interface BoletoInputErrorState {
    firstName?: boolean;
    lastName?: boolean;
    shopperEmail?: boolean;
    socialSecurityNumber?: boolean;
}
