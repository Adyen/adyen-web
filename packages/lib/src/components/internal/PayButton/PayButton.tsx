import { h } from 'preact';
import Button from '../Button';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { ButtonProps } from '../Button/types';
import { payAmountLabel, secondaryAmountLabel } from './utils';
import SecondaryButtonLabel from './components/SecondaryButtonLabel';
import { useAmount, useSecondaryAmount } from '../../../core/Context/AmountProvider';

export interface PayButtonProps extends ButtonProps {
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];
    label?: string;
    status?: string;
    disabled?: boolean;
    icon?: string;
    onClick?: (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
}

const PayButton = ({ classNameModifiers = [], label, ...props }: PayButtonProps) => {
    const { amount, isZeroAuth, isAmountValid } = useAmount();
    const { secondaryAmount } = useSecondaryAmount();
    const { i18n } = useCoreContext();

    const buttonLabel = label || (isZeroAuth ? i18n.get('confirmPreauthorization') : payAmountLabel(i18n, amount));

    /**
     * Show the secondaryLabel if:
     *  - it's not zero auth, and
     *  - we don't have a predefined label (i.e. redirect, qrcode, await based comps...), and
     *  - we do have an amount object (merchant might not be passing this in order to not show the amount on the button), and
     *  - we have a secondaryAmount object with some properties
     */
    const shouldShowSecondaryLabel = !isZeroAuth && !label && isAmountValid && secondaryAmount;
    const secondaryLabel = shouldShowSecondaryLabel ? secondaryAmountLabel(i18n, secondaryAmount) : null;

    const isDisabled = props.disabled || props.status === 'loading';

    return (
        <Button {...props} disabled={isDisabled} classNameModifiers={[...classNameModifiers, 'pay']} label={buttonLabel}>
            {secondaryLabel && <SecondaryButtonLabel label={secondaryLabel} />}
        </Button>
    );
};

export default PayButton;
export { payAmountLabel };
