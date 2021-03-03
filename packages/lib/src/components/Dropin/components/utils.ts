export function getCommonProps(props) {
    return {
        onSubmit: props.onSubmit,
        elementRef: props.elementRef,
        showPayButton: props.showPayButton,
        isDropin: true
    };
}
