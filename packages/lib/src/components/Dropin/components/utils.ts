export function getCommonProps(props) {
    return {
        beforeSubmit: props.beforeSubmit,
        onSubmit: props.onSubmit,
        elementRef: props.elementRef,
        showPayButton: props.showPayButton,
        isDropin: true
    };
}
