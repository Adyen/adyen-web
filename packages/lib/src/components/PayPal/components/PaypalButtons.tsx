import { h } from 'preact';
import {useCallback, useEffect, useRef} from 'preact/hooks';
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
            onApprove
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
        <div className={classnames('adyen-checkout__paypal__buttons', { 'adyen-checkout__paypal-processing': isProcessingPayment })}>
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--paypal" ref={paypalButtonRef} />
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--credit" ref={creditButtonRef} />
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--pay-later" ref={payLaterButtonRef} />

            {isProcessingPayment && (
                <div className="adyen-checkout__paypal">
                    <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--processing">
                        <Spinner size="medium" inline /> {i18n.get('paypal.processingPayment')}
                    </div>
                </div>
            )}
        </div>
    );
}