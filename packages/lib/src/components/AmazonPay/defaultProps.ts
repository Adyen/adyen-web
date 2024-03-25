import { AmazonPayElementProps } from './types';

const defautProps: Partial<AmazonPayElementProps> = {
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
    showPayButton: true,
    onClick: resolve => resolve(),
    onSignOut: resolve => resolve(),
    isExpress: false
};

export default defautProps;
