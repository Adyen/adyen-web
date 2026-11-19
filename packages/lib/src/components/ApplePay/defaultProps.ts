import type { ApplePayConfiguration } from './types';

const defaultProps = {
    isExpress: false,
    amount: { currency: 'USD', value: 0 },
    totalPriceStatus: 'final',
    initiative: 'web',
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
    buttonType: 'plain',
    buttonColor: 'black',
    onClick: resolve => resolve()
} satisfies ApplePayConfiguration;

export default defaultProps;
