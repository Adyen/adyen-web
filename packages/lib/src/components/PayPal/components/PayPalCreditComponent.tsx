import { h } from 'preact';
import { PayPalService } from '../PayPalService';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { getUniqueId } from '../../../utils/idGenerator';

interface PayPalCreditComponentProps {
    paypalService: PayPalService;
    onSubmit: () => void;
    onAdditionalDetails(data: { orderID: string; payerID: string }): void;
    onCancel: () => void;
    onError: (error: Error) => void;
}

export const PayPalCreditComponent = ({ paypalService, onSubmit, onAdditionalDetails, onCancel, onError }: Readonly<PayPalCreditComponentProps>) => {
    const [paymentSession, setPaymentSession] = useState();

    const id = useMemo(() => getUniqueId('paypal_credit'), []);

    useEffect(() => {
        const paymentSession = paypalService.sdkInstance.createPayPalCreditOneTimePaymentSession({
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

        if (paypalService?.paymentMethods?.isEligible('credit')) {
            const creditDetails = paypalService?.paymentMethods?.getDetails('credit');
            const button = document.querySelector(`#paypal-credit-button-${id}`);
            button?.setAttribute('productCode', creditDetails.productCode);
            button?.setAttribute('countryCode', creditDetails.countryCode);
        }
    }, [onAdditionalDetails]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await paymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [paymentSession]);

    return <paypal-credit-button onclick={onClick} class="paypal-white" id={`paypal-credit-button-${id}`} />;
};
