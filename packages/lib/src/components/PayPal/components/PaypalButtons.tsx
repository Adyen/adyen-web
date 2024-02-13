import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import classnames from 'classnames';
import { PayPalButtonsProps, FundingSource } from '../types';
import { getStyle } from '../utils';
import Spinner from '../../internal/Spinner';
import useCoreContext from '../../../core/Context/useCoreContext';

export default function PaypalButtons({
    onInit,
    onApprove,
    onClick,
    onCancel,
    onError,
    onShippingChange,
    onShippingAddressChange,
    onShippingOptionsChange,
    onSubmit,
    isProcessingPayment,
    paypalRef,
    style,
    ...props
}: PayPalButtonsProps) {
    const { i18n } = useCoreContext();
    const isTokenize = props.configuration?.intent === 'tokenize';
    const paypalButtonRef = useRef<HTMLDivElement>(null);
    const creditButtonRef = useRef<HTMLDivElement>(null);
    const payLaterButtonRef = useRef<HTMLDivElement>(null);
    const venmoButtonRef = useRef<HTMLDivElement>(null);

    const createButton = (fundingSource: FundingSource, buttonRef) => {
        const configuration = {
            ...(isTokenize && { createBillingAgreement: onSubmit }),
            ...(!isTokenize && { createOrder: onSubmit }),
            ...(!isTokenize && fundingSource !== 'venmo' && onShippingChange && { onShippingChange }),
            ...(!isTokenize && fundingSource !== 'venmo' && onShippingAddressChange && { onShippingAddressChange }),
            ...(!isTokenize && fundingSource !== 'venmo' && onShippingOptionsChange && { onShippingOptionsChange }),
            fundingSource,
            style: getStyle(fundingSource, style),
            onInit,
            onClick,
            onCancel,
            onError,
            onApprove
        };

        const button = paypalRef.Buttons(configuration);

        if (button.isEligible()) {
            button.render(buttonRef.current);
        }
    };

    useEffect(() => {
        if (onShippingChange && onShippingAddressChange) {
            console.warn(
                'PayPal - "onShippingChange" and "onShippingAddressChange" are defined. It is recommended to only use "onShippingAddressChange", as "onShippingChange" is getting deprecated'
            );
        }
    }, [onShippingChange, onShippingAddressChange]);

    useEffect(() => {
        const { PAYPAL, CREDIT, PAYLATER, VENMO } = paypalRef.FUNDING;
        createButton(PAYPAL, paypalButtonRef);

        if (!props.blockPayPalCreditButton) createButton(CREDIT, creditButtonRef);
        if (!props.blockPayPalPayLaterButton) createButton(PAYLATER, payLaterButtonRef);
        if (!props.blockPayPalVenmoButton) createButton(VENMO, venmoButtonRef);
    }, []);

    const displayContinueToReviewPageButton = props.commit === false;

    return (
        <div className={classnames('adyen-checkout__paypal__buttons', { 'adyen-checkout__paypal-processing': isProcessingPayment })}>
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--paypal" ref={paypalButtonRef} />
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--credit" ref={creditButtonRef} />
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--pay-later" ref={payLaterButtonRef} />
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--venmo" ref={venmoButtonRef} />

            {isProcessingPayment && (
                <div className="adyen-checkout__paypal">
                    <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--processing">
                        <Spinner size="medium" inline />
                        {!displayContinueToReviewPageButton && i18n.get('paypal.processingPayment')}
                    </div>
                </div>
            )}
        </div>
    );
}
