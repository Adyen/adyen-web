export function getCommonProps(props) {
    return {
        amount: props.amount,
        countryCode: props.countryCode,
        elementRef: props.elementRef,
        environment: props.environment,
        i18n: props.i18n,
        installmentOptions: props.installmentOptions,
        loadingContext: props.loadingContext,
        modules: props.modules,
        onAdditionalDetails: props.onAdditionalDetails,
        onCancel: props.onCancel,
        onChange: props.onChange,
        onError: props.onError,
        order: props.order,
        onBalanceCheck: props.onBalanceCheck,
        onOrderRequest: props.onOrderRequest,
        onSubmit: props.onSubmit,
        originKey: props.originKey,
        clientKey: props.clientKey,
        showPayButton: props.showPayButton
    };
}
