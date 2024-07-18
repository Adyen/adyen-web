import { SocialSecurityMode } from '../../types';
import { AddressModeOptions } from './types';

export default {
    type: 'card',

    setComponentRef: () => {},

    // Settings
    hasHolderName: false,
    holderNameRequired: false,
    enableStoreDetails: false,
    hasCVC: true,
    hideCVC: false,
    showBrandIcon: true,
    showBrandsUnderCardNumber: true,
    positionHolderNameOnTop: false,
    billingAddressAllowedCountries: [],
    billingAddressRequired: false,
    billingAddressMode: AddressModeOptions.full,
    billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'],
    installmentOptions: {},
    configuration: { koreanAuthenticationRequired: false, socialSecurityNumberMode: 'auto' as SocialSecurityMode },
    autoFocus: true,
    isPayButtonPrimaryVariant: true,
    disableIOSArrowKeys: true,
    exposeExpiryDate: false,
    forceCompat: false,
    keypadFix: true,
    legacyInputMode: false,
    maskSecurityCode: false,
    minimumExpiryDate: null,
    name: null, // Affects Dropin only
    showInstallmentAmounts: null,

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

    onBinLookup: () => {},

    // Values
    data: {
        billingAddress: {}
    },

    // Customization
    styles: {},
    placeholders: {}
};
