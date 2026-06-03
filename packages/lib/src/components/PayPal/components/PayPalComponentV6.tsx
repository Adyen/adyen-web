import { h } from 'preact';
import { PayPalService } from '../PayPalService';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { getUniqueId } from '../../../utils/idGenerator';

interface PayPalComponentProps {
    paypalService: PayPalService;
    onSubmit: () => void;
    onAdditionalDetails(data: { orderID: string; payerID: string }): void;
    onCancel: () => void;
    onError: (error: Error) => void;
}

const PayPalComponentV6 = ({ paypalService, onSubmit, onAdditionalDetails, onCancel, onError }: Readonly<PayPalComponentProps>) => {
    const [paypalPaymentSession, setPayPalPaymentSession] = useState();
    const [paylaterPaymentSession, setPaylaterPaymentSession] = useState();
    const [creditPaymentSession, setCreditPaymentSession] = useState();
    const id = useMemo(() => getUniqueId('paypal'), []);

    const sessionProps = useMemo(
        () => ({
            // Called when user approves a payment
            onApprove(data) {
                console.log('Payment approved');

                const payload = {
                    orderID: data.orderId,
                    payerID: data.payerId
                };

                onAdditionalDetails(payload);
            },
            // Called when user cancels a payment
            onCancel() {
                onCancel();
            },
            // Called when an error occurs during payment
            onError(error) {
                onError(error);
            }
        }),
        [onAdditionalDetails, onCancel, onError]
    );

    useEffect(() => {
        const payPalPaymentSession = paypalService.sdkInstance.createPayPalOneTimePaymentSession(sessionProps);
        setPayPalPaymentSession(payPalPaymentSession);

        const paylaterPaymentSession = paypalService.sdkInstance.createPayLaterOneTimePaymentSession(sessionProps);
        setPaylaterPaymentSession(paylaterPaymentSession);

        if (paypalService?.paymentMethods?.isEligible('paylater')) {
            const payLaterDetails = paypalService?.paymentMethods?.getDetails('paylater');
            const button = document.querySelector(`#paypal-paylater-button-${id}`);
            button?.setAttribute('productCode', payLaterDetails.productCode);
            button?.setAttribute('countryCode', payLaterDetails.countryCode);
        }

        const creditPaymentSession = paypalService.sdkInstance.createPayPalCreditOneTimePaymentSession(sessionProps);
        setCreditPaymentSession(creditPaymentSession);

        if (paypalService?.paymentMethods?.isEligible('credit')) {
            const creditDetails = paypalService?.paymentMethods?.getDetails('credit');
            const button = document.querySelector(`#paypal-credit-button-${id}`);
            button?.setAttribute('productCode', creditDetails.productCode);
            button?.setAttribute('countryCode', creditDetails.countryCode);
        }
    }, [sessionProps]);

    const onPayPalClick = useCallback(async () => {
        if (!paypalPaymentSession) return;

        await paypalPaymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [paypalPaymentSession]);

    const onPayLaterClick = useCallback(async () => {
        if (!paylaterPaymentSession) return;

        await paylaterPaymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [paylaterPaymentSession]);

    const onCreditClick = useCallback(async () => {
        if (!creditPaymentSession) return;

        await creditPaymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [creditPaymentSession]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            }}
        >
            <paypal-button onclick={onPayPalClick} class="paypal-gold" />
            <paypal-pay-later-button onclick={onPayLaterClick} class="paypal-white" id={`paypal-paylater-button-${id}`} />
            <paypal-credit-button onclick={onCreditClick} class="paypal-white" id={`paypal-credit-button-${id}`} />
        </div>
    );
};

export { PayPalComponentV6 };
