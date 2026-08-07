import { h } from 'preact';
import { useMemo, useEffect, useRef } from 'preact/hooks';

import { PayPalService } from '../services/PayPalService';
import { useAmount } from '../../../core/Context/AmountProvider';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import type { PayPalFetchContentOptions, PayPalMessageElement } from '../paypal-js-types';

export const PayPalMessaging = ({
    paypalService,
    countryCode,
    messagingContentOptions
}: Readonly<{
    paypalService: PayPalService;
    countryCode?: string;
    messagingContentOptions?: Pick<PayPalFetchContentOptions, 'logoType' | 'logoPosition' | 'textColor'>;
}>) => {
    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);
    const messageElementRef = useRef<PayPalMessageElement | null>(null);
    const { amount } = useAmount();
    const { i18n } = useCoreContext();

    useEffect(() => {
        const fetchMessageContent = async (): Promise<void> => {
            const messagesInstance = payPalSDKInstance.createPayPalMessages({
                buyerCountry: countryCode,
                currencyCode: amount.currency
            });

            const amountString = i18n.amount(amount.value, amount.currency, {
                style: 'decimal',
                minimumFractionDigits: 0,
                signDisplay: 'never'
            });

            await messagesInstance.fetchContent({
                textColor: messagingContentOptions?.textColor ?? 'BLACK',
                logoPosition: messagingContentOptions?.logoPosition ?? 'LEFT',
                logoType: messagingContentOptions?.logoType ?? 'TEXT',
                amount: amountString,
                onReady: content => {
                    messageElementRef.current?.setContent(content);
                }
            });
        };

        void fetchMessageContent();
    }, [payPalSDKInstance, countryCode, amount?.currency, amount?.value]);

    return <paypal-message id="paypal-message" ref={messageElementRef}></paypal-message>;
};
