import { h } from 'preact';
import { PayPalService } from '../PayPalService';
import { useCallback, useEffect, useState } from 'preact/hooks';

interface VenmoComponentProps {
    paypalService: PayPalService;
    onSubmit: () => void;
    onAdditionalDetails(data: { orderID: string; payerID: string }): void;
}

export const VenmoComponent = ({ paypalService, onSubmit, onAdditionalDetails }: VenmoComponentProps) => {
    const [paymentSession, setPaymentSession] = useState();

    useEffect(() => {
        const venmoPaymentSession = paypalService.sdkInstance.createVenmoOneTimePaymentSession({
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

        setPaymentSession(venmoPaymentSession);
    }, [onAdditionalDetails]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await paymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [paymentSession]);

    return <venmo-button onclick={onClick} id="venmo-blue" type="pay"></venmo-button>;
};
