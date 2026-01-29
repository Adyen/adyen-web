import { h } from 'preact';
import { PayPalService } from '../PayPalService';
import { useCallback, useEffect, useState } from 'preact/hooks';

interface PayPalComponentProps {
    paypalService: PayPalService;
    onSubmit: () => void;
    onAdditionalDetails(data: { orderID: string; payerID: string }): void;
}

const PayPalComponentV6 = ({ paypalService, onSubmit, onAdditionalDetails }: PayPalComponentProps) => {
    const [paymentSession, setPaymentSession] = useState();

    useEffect(() => {
        const paypalPaymentSession = paypalService.sdkInstance.createPayPalOneTimePaymentSession({
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
            onCancel(data) {
                console.log('Payment cancelled:', data);
            },
            // Called when an error occurs during payment
            onError(error) {
                console.error('Payment error:', error);
            }
        });

        setPaymentSession(paypalPaymentSession);
    }, [onAdditionalDetails]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await paymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [paymentSession]);

    return <paypal-button onclick={onClick} id="paypal-button" type="pay"></paypal-button>;
};

export { PayPalComponentV6 };
