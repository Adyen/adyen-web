export default {
    type: 'ach',

    // Settings
    hasHolderName: true,
    holderNameRequired: true,
    billingAddressRequired: true,
    billingAddressAllowedCountries: ['US', 'PR'],
    showFormInstruction: true,
    showContextualElement: true,

    // Events
    onLoad: () => {},
    onConfigSuccess: () => {},
    onAllValid: () => {},
    onFieldValid: () => {},
    onError: () => {},
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
    placeholders: {},
    contextualTexts: {}
};
