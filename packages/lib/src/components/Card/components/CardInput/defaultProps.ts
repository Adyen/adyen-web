import { SocialSecurityMode } from '../../types';
import { AddressModeOptions } from './types';

export default {
    type: 'scheme',

    setComponentRef: () => {},

    // Settings
    hasHolderName: false,
    holderNameRequired: false,
    enableStoreDetails: false,
    hasCVC: true,
    showBrandIcon: true,
    showBrandsUnderCardNumber: true,
    positionHolderNameOnTop: false,
    billingAddressRequired: false,
    billingAddressMode: AddressModeOptions.full,
    billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'],
    installmentOptions: {},
    configuration: { koreanAuthenticationRequired: false, socialSecurityNumberMode: 'auto' as SocialSecurityMode },
    autoFocus: true,
    isPayButtonPrimaryVariant: true,
    disableIOSArrowKeys: false,
    showContextualElement: true,

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
    placeholders: {}
};
