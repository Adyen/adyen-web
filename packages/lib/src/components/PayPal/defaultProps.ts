import { PayPalElementProps } from './types';

const defaultProps: PayPalElementProps = {
    environment: 'TEST',
    status: 'loading',
    showPayButton: true,

    // Config
    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#merchant-id}
     */
    merchantId: '',

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#intent}
     */
    intent: null,

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#commit}
     */
    commit: true,

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#vault}
     */
    vault: false,

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/}
     */
    style: {
        /**
         * The height of the buttons is set to 48px to align with the default size of our Pay buttons.
         */
        height: 48
    },

    configuration: {
        /**
         * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#merchant-id}
         */
        merchantId: '',
        /**
         * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#intent}
         */
        intent: null
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
