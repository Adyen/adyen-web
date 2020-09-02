import { h } from 'preact';
import Button from '../Button';
import useCoreContext from '../../../core/Context/useCoreContext';
import { PaymentAmount } from '../../../types';

interface PayButtonProps {
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];

    label?: string;
    amount: PaymentAmount;
}

const PayButton = ({ amount, classNameModifiers = [], label, ...props }: PayButtonProps) => {
    const { i18n } = useCoreContext();
    const isZeroAuth = amount && {}.hasOwnProperty.call(amount, 'value') && amount.value === 0;
    const defaultLabel = isZeroAuth
        ? i18n.get('confirmPreauthorization')
        : `${i18n.get('payButton')} ${!!amount?.value && !!amount?.currency ? i18n.amount(amount.value, amount.currency) : ''}`;

    return <Button {...props} classNameModifiers={[...classNameModifiers, 'pay']} label={label || defaultLabel} />;
};

export default PayButton;
