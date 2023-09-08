import { AmazonPayElementProps } from './types';

const defaultProps: Partial<AmazonPayElementProps> = {
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
    onClick: resolve => resolve(),
    onSignOut: resolve => resolve()
};

export default defaultProps;
