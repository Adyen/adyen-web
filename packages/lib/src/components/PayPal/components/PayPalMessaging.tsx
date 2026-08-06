import { h } from 'preact';
import { useMemo, useEffect, useRef } from 'preact/hooks';

import { PayPalService } from '../services/PayPalService';
import { useAmount } from '../../../core/Context/AmountProvider';

export const PayPalMessaging = ({
    paypalService,
    countryCode
}: Readonly<{
    paypalService: PayPalService;
    countryCode?: string;
}>) => {
    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);
    const messageElementRef = useRef<HTMLElement | null>(null);
    const { amount } = useAmount();

    useEffect(() => {
        const fetchMessageContent = async (): Promise<void> => {
            const messagesInstance = payPalSDKInstance.createPayPalMessages({
                buyerCountry: countryCode,
                currencyCode: amount.currency
            });

            await messagesInstance.fetchContent({
                textColor: 'BLACK',
                logoPosition: 'LEFT',
                logoType: 'TEXT',
                amount: String(amount.value / 100),
                onReady: content => {
                    // @ts-ignore - messageElement is guaranteed to be a PayPalMessageElement
                    messageElementRef.current?.setContent(content);
                }
            });
        };

        void fetchMessageContent();
    }, [payPalSDKInstance]);

    return <paypal-message id="paypal-message" ref={messageElementRef}></paypal-message>;
};
