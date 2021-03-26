export default {
    details: [],
    type: 'card',

    // Settings
    hasHolderName: false,
    holderNameRequired: false,
    enableStoreDetails: false,
    hideCVC: false,
    hasCVC: true,
    hasStoreDetails: false,
    storedDetails: false,
    showBrandIcon: true,
    positionHolderNameOnTop: false,
    billingAddressRequired: false,
    billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'],
    installmentOptions: {},
    configuration: { koreanAuthenticationRequired: false },

    // Events
    onLoad: () => {},
    onConfigSuccess: () => {},
    onAllValid: () => {},
    onFieldValid: () => {},
    onBrand: () => {},
    onError: () => {},
    onBinValue: () => {},
    onBlur: () => {},
    onFocus: () => {},
    onChange: () => {},

    // Values
    holderName: '',
    data: {
        holderName: '',
        billingAddress: {}
    },

    // Customization
    styles: {},
    placeholders: {}
};
