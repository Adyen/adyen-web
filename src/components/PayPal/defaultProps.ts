import { PayPalElementProps } from './types';

const defaultProps: PayPalElementProps = {
    environment: 'TEST',
    status: 'loading',

    // Config
    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#merchant-id}
     */
    merchantId: '',

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/}
     */
    style: {
        /**
         * The height of the buttons is set to 48px to align with the default size of our Pay buttons.
         */
        height: 48
    },

    // Events
    onSubmit: () => {},
    onAdditionalDetails: () => {},
    onInit: () => {},
    onClick: () => {},
    onCancel: () => {},
    onError: () => {}
};

export default defaultProps;
