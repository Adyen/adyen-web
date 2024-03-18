import { ApplePayConfiguration } from './types';

const defaultProps: ApplePayConfiguration = {
    isExpress: false,
    amount: { currency: 'USD', value: 0 },
    totalPriceStatus: 'final',
    initiative: 'web',
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
    buttonType: 'plain',
    buttonColor: 'black',
    onClick: resolve => resolve()
};

export default defaultProps;
