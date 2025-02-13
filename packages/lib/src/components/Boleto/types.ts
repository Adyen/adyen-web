import Language from '../../language/Language';
import { AddressData } from '../../types/global-types';
import { VoucherConfiguration } from '../internal/Voucher/types';

export interface BoletoConfiguration extends VoucherConfiguration {
    /**
     * Set to false if you have already collected the shopper's first name, last name, and CPF/CNPJ (socialSecurityNumber).
     * @default true
     */
    personalDetailsRequired?: boolean;
    /**
     * Set this to false if you have already collected the shopper's street, house number or name, city, postal code, and state or province.
     * @default true
     */
    billingAddressRequired?: boolean;
    /**
     * Set this to false if you have already collected the shopper's email address.
     * @default true
     */
    showEmailAddress?: boolean;
    /**
     * Object to pre-fill shopper details on the form
     */
    data?: BoletoInputDataState;
}

export interface BoletoElementProps {
    type: string;
    i18n: Language;
    loadingContext: string;
    reference?: string;
}

export interface BoletoInputDataState {
    firstName?: string;
    lastName?: string;
    billingAddress?: AddressData;
    socialSecurityNumber?: string;
    shopperEmail?: string;
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
