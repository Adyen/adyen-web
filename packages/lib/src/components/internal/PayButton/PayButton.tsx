import { h } from 'preact';
import Button from '../Button';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { ButtonProps } from '../Button/types';
import { payAmountLabel, secondaryAmountLabel } from './utils';
import { PaymentAmountExtended } from '../../../types/global-types';
import SecondaryButtonLabel from './components/SecondaryButtonLabel';

export interface PayButtonProps extends ButtonProps {
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];
    label?: string;
    amount?: PaymentAmountExtended;
    secondaryAmount?: PaymentAmountExtended;
    status?: string;
    disabled?: boolean;
    icon?: string;
    onClick?: (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
}

const PayButton = ({ amount, secondaryAmount, classNameModifiers = [], label, ...props }: PayButtonProps) => {
    const { i18n } = useCoreContext();
    const isZeroAuth = amount && {}.hasOwnProperty.call(amount, 'value') && amount.value === 0;
    const defaultLabel = isZeroAuth ? i18n.get('confirmPreauthorization') : payAmountLabel(i18n, amount);

    /**
     * Show the secondaryLabel if:
     *  - it's not zero auth, and
     *  - we don't have a predefined label (i.e. redirect, qrcode, await based comps...), and
     *  - we do have an amount object (merchant might not be passing this in order to not show the amount on the button), and
     *  - we have a secondaryAmount object with some properties
     */
    const hasValidAmount = amount && typeof amount.value === 'number' && !!amount.currency;
    const hasSecondaryAmount = secondaryAmount && Object.keys(secondaryAmount).length > 0;

    const secondaryLabel = !isZeroAuth && !label && hasValidAmount && hasSecondaryAmount ? secondaryAmountLabel(i18n, secondaryAmount) : null;

    return (
        <Button
            {...props}
            disabled={props.disabled || props.status === 'loading'}
            classNameModifiers={[...classNameModifiers, 'pay']}
            label={label || defaultLabel}
        >
            {secondaryLabel && <SecondaryButtonLabel label={secondaryLabel} />}
        </Button>
    );
};

export default PayButton;
export { payAmountLabel };
