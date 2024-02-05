export default {
    type: 'card',

    // Settings
    keypadFix: true,
    rootNode: null,
    loadingContext: null,
    brands: [],
    showWarnings: false,
    autoFocus: true,
    trimTrailingSeparator: true,

    // Events
    onChange: () => {},
    onLoad: () => {},
    onConfigSuccess: () => {},
    onAllValid: () => {},
    onFieldValid: () => {},
    onBrand: () => {},
    onError: () => {},
    onBinValue: () => {},
    onFocus: () => {},
    onAutoComplete: () => {},

    // Customization
    styles: {}
};
