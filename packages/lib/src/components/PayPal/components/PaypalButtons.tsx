import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { PayPalButtonsProps, FundingSource } from '../types';
import { getStyle } from '../utils';

export default function PaypalButtons(props: PayPalButtonsProps) {
    const { onInit, onComplete, onClick, onCancel, onError, onShippingChange, onSubmit, paypalRef, style } = props;
    const isTokenize = props.configuration?.intent === 'tokenize';
    const paypalButtonRef = useRef<HTMLDivElement>(null);
    const creditButtonRef = useRef<HTMLDivElement>(null);
    const payLaterButtonRef = useRef<HTMLDivElement>(null);

    const createButton = (fundingSource: FundingSource, buttonRef) => {
        const button = paypalRef.Buttons({
            ...(isTokenize && { createBillingAgreement: onSubmit }),
            ...(!isTokenize && {
                createOrder: onSubmit,
                onShippingChange
            }),
            fundingSource,
            style: getStyle(fundingSource, style),
            onInit,
            onClick,
            onCancel,
            onError,
            onApprove: function(details, actions) {
                if (!actions) {
                    return onComplete(details, null);
                }

                return actions.order.get().then(function(data) {
                    const payerData = data.payer || {};
                    onComplete(details, payerData);
                });
            }
        });

        if (button.isEligible()) {
            button.render(buttonRef.current);
        }
    };

    useEffect(() => {
        const { PAYPAL, CREDIT, PAYLATER } = paypalRef.FUNDING;
        createButton(PAYPAL, paypalButtonRef);
        if (!props.blockPayPalCreditButton) createButton(CREDIT, creditButtonRef);
        if (!props.blockPayPalPayLaterButton) createButton(PAYLATER, payLaterButtonRef);
    }, []);

    return (
        <div className="adyen-checkout__paypal__buttons">
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--paypal" ref={paypalButtonRef} />
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--credit" ref={creditButtonRef} />
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--pay-later" ref={payLaterButtonRef} />
        </div>
    );
}
