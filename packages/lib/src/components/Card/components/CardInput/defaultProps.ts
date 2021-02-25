export default {
    details: [],
    type: 'card',

    // Settings
    hasHolderName: false,
    holderNameRequired: false,
    enableStoreDetails: false,
    hideCVC: false, // passed down to SFP for the "NoDataRequired" scenario with one-click PMs (where CVC is hidden or optional)
    hasCVC: true,
    hasStoreDetails: false,
    storedDetails: false,
    showBrandIcon: true,
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
