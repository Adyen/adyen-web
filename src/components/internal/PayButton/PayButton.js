import { h } from 'preact';
import Button from '../Button';
import useCoreContext from '../../../core/Context/useCoreContext';

const PayButton = ({ amount = {}, classNameModifiers = [], label, ...props }) => {
    const { i18n } = useCoreContext();
    const isZeroAuth = amount && {}.hasOwnProperty.call(amount, 'value') && amount.value === 0;
    const defaultLabel = isZeroAuth
        ? i18n.get('confirmPreauthorization')
        : `${i18n.get('payButton')} ${!!amount.value && !!amount.currency ? i18n.amount(amount.value, amount.currency) : ''}`;

    return <Button {...props} classNameModifiers={[...classNameModifiers, 'pay']} i18n={i18n} label={label || defaultLabel} />;
};

export default PayButton;
