import Language from '../../language/Language';
import { AddressData } from '../../types';

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

// An interface for the members exposed by a component to its parent UIElement
export interface BoletoRef {
    showValidation?: (who) => void;
    setStatus?: any;
}
