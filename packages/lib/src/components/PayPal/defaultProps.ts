import { PayPalConfiguration } from './types';

const defaultProps: Partial<PayPalConfiguration> = {
    isExpress: false,
    userAction: 'pay',
    commit: true,
    vault: false,
    enableMessages: false,
    style: {
        height: 50 // The height of the buttons is set to 50px to align with the default size of our Pay buttons.
    },
    blockPayPalCreditButton: true, // If both Credit and Pay Later being enabled, Credit takes precedence.
    blockPayPalPayLaterButton: false, // Pay Later is considered the more modern PayPal Credit offering.
    blockPayPalVenmoButton: false
};

export default defaultProps;
