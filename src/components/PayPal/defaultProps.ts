const defaultProps = {
    environment: 'TEST',
    status: 'loading',

    // Config
    merchantId: '',
    style: {
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
