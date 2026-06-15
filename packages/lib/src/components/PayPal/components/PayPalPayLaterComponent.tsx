import { h } from 'preact';
import { PayPalService } from '../PayPalService';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { getUniqueId } from '../../../utils/idGenerator';

interface PayPalPayLaterComponentProps {
    paypalService: PayPalService;
    onSubmit: () => void;
    onAdditionalDetails(data: { orderID: string; payerID: string }): void;
    onCancel: () => void;
    onError: (error: Error) => void;
}

export const PayPalPayLaterComponent = ({
    paypalService,
    onSubmit,
    onAdditionalDetails,
    onCancel,
    onError
}: Readonly<PayPalPayLaterComponentProps>) => {
    const [paymentSession, setPaymentSession] = useState();

    const id = useMemo(() => getUniqueId('paypal_paylater'), []);

    useEffect(() => {
        const paymentSession = paypalService.sdkInstance.createPayLaterOneTimePaymentSession({
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

        setPaymentSession(paymentSession);

        if (paypalService?.paymentMethods?.isEligible('paylater')) {
            const payLaterDetails = paypalService?.paymentMethods?.getDetails('paylater');
            const button = document.querySelector(`#paypal-paylater-button-${id}`);
            button?.setAttribute('productCode', payLaterDetails.productCode);
            button?.setAttribute('countryCode', payLaterDetails.countryCode);
        }
    }, [onAdditionalDetails]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await paymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [paymentSession]);

    return <paypal-pay-later-button onclick={onClick} class="paypal-white" id={`paypal-paylater-button-${id}`} />;
};
