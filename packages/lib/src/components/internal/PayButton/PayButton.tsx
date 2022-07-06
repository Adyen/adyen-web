import { h } from 'preact';
import Button from '../Button';
import useCoreContext from '../../../core/Context/useCoreContext';
import { PaymentAmount } from '../../../types';
import { ButtonProps } from '../Button/types';
import { payAmountLabel } from './utils';

export interface PayButtonProps extends ButtonProps {
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];

    label?: string;
    amount: PaymentAmount;
    status?: string;
}

const PayButton = ({ amount, classNameModifiers = [], label, ...props }: PayButtonProps) => {
    const { i18n } = useCoreContext();
    const isZeroAuth = amount && {}.hasOwnProperty.call(amount, 'value') && amount.value === 0;
    const defaultLabel = isZeroAuth ? i18n.get('confirmPreauthorization') : payAmountLabel(i18n, amount);

    return (
        <Button {...props} disabled={props.status === 'loading'} classNameModifiers={[...classNameModifiers, 'pay']} label={label || defaultLabel} />
    );
};

export default PayButton;
export { payAmountLabel };
