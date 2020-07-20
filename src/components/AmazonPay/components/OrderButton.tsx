import useCoreContext from '../../../core/Context/useCoreContext';

export default function OrderButton(props) {
    const { i18n } = useCoreContext();

    return props.payButton({
        classNameModifiers: ['standalone'],
        label: i18n.get('confirmPurchase')
    });
}
