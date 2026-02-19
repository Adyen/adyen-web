import { h } from 'preact';
import Button from '../Button';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { ButtonProps } from '../Button/types';
import { createButtonLabel, createSecondaryLabel } from './utils';
import SecondaryButtonLabel from './components/SecondaryButtonLabel';
import { useAmount, useSecondaryAmount } from '../../../core/Context/AmountProvider';
import type { PaymentAmount } from '../../../types';
import { isAmountValid } from '../../../utils/amount-util';

export interface PayButtonProps extends ButtonProps {
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];
    /**
     * Custom amount that can be passed to the button.
     * This is useful when the amount is not available in the amount provider, such as Giftcard scenario where
     * we need to display the remaining amount
     */
    customAmount?: PaymentAmount;
    label?: string;
    status?: string;
    disabled?: boolean;
    icon?: string;
    onClick?: (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
}

const PayButton = ({ customAmount, classNameModifiers = [], label, ...props }: PayButtonProps) => {
    const { amount, isZeroAuth } = useAmount();
    const { secondaryAmount } = useSecondaryAmount();
    const { i18n } = useCoreContext();

    const buttonLabel = createButtonLabel(i18n, label, amount, isZeroAuth, customAmount);
    const secondaryAmountLabel = createSecondaryLabel(i18n, secondaryAmount, isAmountValid(amount), isZeroAuth, label);

    const isDisabled = props.disabled || props.status === 'loading';

    return (
        <Button {...props} disabled={isDisabled} classNameModifiers={[...classNameModifiers, 'pay']} label={buttonLabel}>
            {secondaryAmountLabel && <SecondaryButtonLabel label={secondaryAmountLabel} />}
        </Button>
    );
};

export default PayButton;
