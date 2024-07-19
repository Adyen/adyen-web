import { SocialSecurityMode } from '../../types';
import { AddressModeOptions } from './types';

export default {
    type: 'card',

    setComponentRef: () => {},

    // Settings
    autoFocus: true,
    billingAddressAllowedCountries: [],
    billingAddressMode: AddressModeOptions.full,
    billingAddressRequired: false,
    billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'],

    configuration: { koreanAuthenticationRequired: false, socialSecurityNumberMode: 'auto' as SocialSecurityMode },
    data: {
        billingAddress: {}
    },
    disableIOSArrowKeys: true,
    enableStoreDetails: false,
    exposeExpiryDate: false,
    forceCompat: false,
    hasHolderName: false,
    holderNameRequired: false,
    hasCVC: true,
    hideCVC: false,
    installmentOptions: {},
    keypadFix: true,
    legacyInputMode: false,
    maskSecurityCode: false,
    minimumExpiryDate: null,
    name: null, // Affects Dropin only, the name displayed in the PMList item
    placeholders: {},
    positionHolderNameOnTop: false,
    showBrandIcon: true,
    showBrandsUnderCardNumber: true,
    showInstallmentAmounts: null,
    styles: {},

    isPayButtonPrimaryVariant: true,

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

    onBinLookup: () => {} // Strictly speaking a Card level prop, but needed here for analytics.configData
};
