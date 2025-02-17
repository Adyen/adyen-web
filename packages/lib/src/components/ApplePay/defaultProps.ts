import { ApplePayConfiguration } from './types';
import { inIframe } from '../../utils/inIframe';

const defaultProps: ApplePayConfiguration = {
    isExpress: false,
    amount: { currency: 'USD', value: 0 },
    totalPriceStatus: 'final',
    initiative: 'web',
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
    buttonType: 'plain',
    buttonColor: 'black',
    renderApplePayCodeAs: inIframe() ? 'window' : 'modal',
    onClick: resolve => resolve()
};

export default defaultProps;
