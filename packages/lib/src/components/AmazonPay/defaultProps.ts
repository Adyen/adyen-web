import { AmazonPayConfiguration } from './types';

const defaultProps: Partial<AmazonPayConfiguration> = {
    cancelUrl: typeof window !== 'undefined' ? window.location.href : '',
    configuration: {},
    environment: 'TEST',
    locale: 'en_GB',
    placement: 'Cart',
    productType: 'PayAndShip',
    returnUrl: typeof window !== 'undefined' ? window.location.href : '',
    showOrderButton: true,
    showChangePaymentDetailsButton: false,
    showSignOutButton: false,
    onClick: () => Promise.resolve(),
    onSignOut: () => Promise.resolve(),
    isExpress: false
};

export default defaultProps;
