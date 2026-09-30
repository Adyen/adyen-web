import { Fragment, h } from 'preact';
import { useMemo } from 'preact/hooks';
import Button from '../Button';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { ButtonProps } from '../Button/types';
import { createButtonLabel, createSecondaryLabel } from './utils';
import SecondaryButtonLabel from './components/SecondaryButtonLabel';
import { useAmount, useSecondaryAmount } from '../../../core/Context/AmountProvider';
import type { PaymentAmount } from '../../../types';
import { isAmountValid } from '../../../utils/amount-util';
import { getUniqueId } from '../../../utils/idGenerator';
import DisclaimerMessage, { formatDisclaimerMessage } from '../DisclaimerMessage';
import type { DisclaimerMsgObject } from '../DisclaimerMessage';

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
    showReview?: boolean;
    /**
     * Disclaimer message displayed above the button
     */
    disclaimerMessage?: DisclaimerMsgObject;
    /**
     * Hides the button itself. The disclaimer message is still rendered, since it belongs to the
     * payment step rather than to the button, and merchants hiding the button supply their own.
     * @defaultValue `true`
     */
    showPayButton?: boolean;
}

const PayButton = ({
    customAmount,
    classNameModifiers = [],
    label,
    icon,
    showReview,
    disclaimerMessage,
    showPayButton = true,
    ...props
}: Readonly<PayButtonProps>) => {
    const { amount, isZeroAuth } = useAmount();
    const { secondaryAmount } = useSecondaryAmount();
    const { i18n } = useCoreContext();

    const buttonLabel = createButtonLabel(i18n, { customLabel: label, amount, isZeroAuth, customAmount, secondaryAmount, showReview });
    const buttonIcon = icon && !showReview ? icon : undefined;
    const secondaryAmountLabel = createSecondaryLabel(i18n, secondaryAmount, isAmountValid(amount), isZeroAuth, label);

    const isDisabled = props.disabled || props.status === 'loading';
    const formattedDisclaimerMessage = disclaimerMessage && formatDisclaimerMessage(disclaimerMessage);
    const disclaimerId = useMemo(() => getUniqueId('pay-button-disclaimer'), []);
    const ariaDescribedBy =
        [props.ariaDescribedBy, formattedDisclaimerMessage?.message ? disclaimerId : undefined].filter(Boolean).join(' ') || undefined;

    return (
        <Fragment>
            {formattedDisclaimerMessage?.message && <DisclaimerMessage {...formattedDisclaimerMessage} id={disclaimerId} />}
            {showPayButton && (
                <Button
                    {...props}
                    ariaDescribedBy={ariaDescribedBy}
                    icon={buttonIcon}
                    disabled={isDisabled}
                    classNameModifiers={[...classNameModifiers, 'pay']}
                    label={buttonLabel}
                >
                    {secondaryAmountLabel && <SecondaryButtonLabel label={secondaryAmountLabel} />}
                </Button>
            )}
        </Fragment>
    );
};

export default PayButton;
