import { PayPalConfiguration } from './types';

const defaultProps: Partial<PayPalConfiguration> = {
    isExpress: false,
    userAction: 'pay',
    commit: true,
    vault: false,
    enableMessages: false,
    style: {
        height: 48 // The height of the buttons is set to 48px to align with the default size of our Pay buttons.
    },
    blockPayPalCreditButton: false,
    blockPayPalPayLaterButton: false,
    blockPayPalVenmoButton: false
};

export default defaultProps;
