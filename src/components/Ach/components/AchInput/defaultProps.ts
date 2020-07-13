export default {
    details: [],
    type: 'ach',

    // Settings
    hasHolderName: true,
    holderNameRequired: true,
    billingAddressRequired: true,
    billingAddressAllowedCountries: ['US', 'PR'],

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

    originKey: null,

    // Values
    holderName: '',
    data: {
        holderName: '',
        billingAddress: {}
    },

    // Customization
    styles: {},
    placeholders: {},
    ariaLabels: {}
};
