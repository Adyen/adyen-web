import { h } from 'preact';
import { PayPalService } from '../PayPalService';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { getUniqueId } from '../../../utils/idGenerator';

interface PayPalComponentProps {
    paypalService: PayPalService;
    onSubmit: () => void;
    onAdditionalDetails(data: { orderID: string; payerID: string }): void;
    currencyCode: string;
    countryCode: string;
}

const PayPalComponentV6 = ({ paypalService, onSubmit, onAdditionalDetails, currencyCode, countryCode }: PayPalComponentProps) => {
    const [paymentSession, setPaymentSession] = useState();
    const id = useMemo(getUniqueId, []);

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

    useEffect(() => {
        (async () => {
            const paymentMethods = await paypalService.sdkInstance.findEligibleMethods({
                currencyCode,
                countryCode
            });

            const payLaterDetails = paymentMethods.getDetails('paylater');

            const button = document.querySelector(`#paypal-pay-later-button-${id}`);
            button.productCode = payLaterDetails.productCode;
            button.countryCode = payLaterDetails.countryCode;
        })();
    }, []);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await paymentSession.start({ presentationMode: 'auto' }, onSubmit());
    }, [paymentSession]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            }}
        >
            <paypal-button onclick={onClick} type="pay" class="paypal-black" id={`paypal-button-${id}`}></paypal-button>
            <paypal-pay-later-button onclick={onClick} class="paypal-white" id={`paypal-pay-later-button-${id}`}></paypal-pay-later-button>
            <paypal-credit-button onclick={onClick} class="paypal-white" id={`paypal-credit-button-${id}`}></paypal-credit-button>
        </div>
    );
};

export { PayPalComponentV6 };
