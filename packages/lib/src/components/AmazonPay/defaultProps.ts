export default {
    cancelUrl: typeof window !== 'undefined' ? window.location.href : '',
    configuration: {},
    environment: 'TEST',
    locale: 'en_GB',
    placement: 'Cart',
    productType: 'PayAndShip',
    region: 'EU',
    returnUrl: typeof window !== 'undefined' ? window.location.href : '',
    showOrderButton: true,
    showChangePaymentDetailsButton: false,
    showSignOutButton: false,
    showPayButton: true,
    onClick: resolve => resolve(),
    onSignOut: resolve => resolve()
};
