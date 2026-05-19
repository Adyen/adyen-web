import { h } from 'preact';
import { PayPalService } from '../PayPalService';
import { useCallback, useEffect, useState } from 'preact/hooks';

interface VenmoComponentProps {
    paypalService: PayPalService;
    onSubmit: () => void;
    onAdditionalDetails(data: { orderID: string; payerID: string }): void;
    onCancel: () => void;
    onError: (error: Error) => void;
}

export const VenmoComponent = ({ paypalService, onSubmit, onAdditionalDetails, onCancel, onError }: Readonly<VenmoComponentProps>) => {
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
            onCancel() {
                onCancel();
            },
            // Called when an error occurs during payment
            onError(error) {
                onError(error);
            }
        });

        setPaymentSession(venmoPaymentSession);
    }, [onAdditionalDetails]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await paymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [paymentSession]);

    return <venmo-button onclick={onClick} id="venmo-blue" />;
};
