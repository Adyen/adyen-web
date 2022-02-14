import { SocialSecurityMode } from '../../types';
import {AddressModeOptions} from "../../../internal/Address/types";

export default {
    type: 'card',

    setComponentRef: () => {},

    // Settings
    hasHolderName: false,
    holderNameRequired: false,
    enableStoreDetails: false,
    hasCVC: true,
    showBrandIcon: true,
    positionHolderNameOnTop: false,
    billingAddressRequired: false,
    billingAddressMode: AddressModeOptions.full,
    billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'],
    installmentOptions: {},
    configuration: { koreanAuthenticationRequired: false, socialSecurityNumberMode: 'auto' as SocialSecurityMode },

    // Events
    onLoad: (): any => {},
    onConfigSuccess: (): any => {},
    onAllValid: (): any => {},
    onFieldValid: (): any => {},
    onBrand: (): any => {},
    onError: (): any => {},
    onBinValue: (): any => {},
    onBlur: (): any => {},
    onFocus: (): any => {},
    onChange: (): any => {},

    // Values
    data: {
        billingAddress: {}
    },

    // Customization
    styles: {},
    placeholders: {},

    // a11y
    SRConfig: {}
};
