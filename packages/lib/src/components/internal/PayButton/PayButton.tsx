import { h } from 'preact';
import Button from '../Button';
import useCoreContext from '../../../core/Context/useCoreContext';
import { PaymentAmountExtended } from '../../../types';
import Language from '../../../language/Language';

export interface PayButtonProps {
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];
    label?: string;
    amount: PaymentAmountExtended;
    secondaryAmount?: PaymentAmountExtended;
    status?: string;
    disabled?: boolean;
    icon?: string;
    onClick?(): void;
}

const payAmountLabel = (i18n: Language, amount: PaymentAmountExtended) => {
    const payStr = `${i18n.get('payButton')}`;

    const primaryAmount =
        !!amount?.value && !!amount?.currency
            ? i18n.amount(amount.value, amount.currency, { currencyDisplay: amount.currencyDisplay || 'symbol' })
            : '';

    return `${payStr} ${primaryAmount}`;
};

const secondaryAmountLabel = (i18n: Language, secondaryAmount: PaymentAmountExtended) => {
    const convertedSecondaryAmount =
        secondaryAmount && !!secondaryAmount?.value && !!secondaryAmount?.currency
            ? i18n.amount(secondaryAmount.value, secondaryAmount.currency, { currencyDisplay: secondaryAmount.currencyDisplay || 'symbol' })
            : '';

    const divider = convertedSecondaryAmount.length ? '/ ' : '';

    return `${divider}${convertedSecondaryAmount}`;
};

const PayButton = ({ amount, secondaryAmount, classNameModifiers = [], label, ...props }: PayButtonProps) => {
    const { i18n } = useCoreContext();
    const isZeroAuth = amount && {}.hasOwnProperty.call(amount, 'value') && amount.value === 0;
    const defaultLabel = isZeroAuth ? i18n.get('confirmPreauthorization') : payAmountLabel(i18n, amount);

    const secondaryLabel = secondaryAmount && Object.keys(secondaryAmount).length ? secondaryAmountLabel(i18n, secondaryAmount) : null;

    return (
        <Button
            {...props}
            disabled={props.disabled || props.status === 'loading'}
            classNameModifiers={[...classNameModifiers, 'pay']}
            label={label || defaultLabel}
            secondaryLabel={secondaryLabel}
        />
    );
};

export default PayButton;
export { payAmountLabel };
