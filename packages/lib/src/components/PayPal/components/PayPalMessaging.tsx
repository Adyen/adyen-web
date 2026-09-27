import { h } from 'preact';
import { useMemo, useEffect, useRef } from 'preact/hooks';

import { PayPalService } from '../services/PayPalService';
import { useAmount } from '../../../core/Context/AmountProvider';
import type { PayPalFetchContentOptions, PayPalMessageElement } from '../paypal-js-types';
import { getDecimalAmount } from '../../../utils/amount-util';

export const PayPalMessaging = ({
    paypalService,
    countryCode,
    messagingContentOptions,
    onError
}: Readonly<{
    paypalService: PayPalService;
    countryCode?: string;
    messagingContentOptions?: Pick<PayPalFetchContentOptions, 'logoType' | 'logoPosition' | 'textColor'>;
    onError: (error: Error) => void;
}>) => {
    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);
    const messageElementRef = useRef<PayPalMessageElement | null>(null);
    const { amount } = useAmount();

    useEffect(() => {
        const fetchMessageContent = async (): Promise<void> => {
            try {
                const messagesInstance = payPalSDKInstance.createPayPalMessages({
                    buyerCountry: countryCode,
                    currencyCode: amount?.currency
                });

                const amountString = amount ? String(getDecimalAmount(amount.value, amount.currency)) : undefined;

                await messagesInstance.fetchContent({
                    textColor: messagingContentOptions?.textColor ?? 'BLACK',
                    logoPosition: messagingContentOptions?.logoPosition ?? 'LEFT',
                    logoType: messagingContentOptions?.logoType ?? 'TEXT',
                    amount: amountString,
                    onReady: content => {
                        messageElementRef.current?.setContent(content);
                    }
                });
            } catch (error) {
                onError(error as Error);
            }
        };

        void fetchMessageContent();
    }, [payPalSDKInstance, countryCode, amount?.currency, amount?.value, onError]);

    return <paypal-message id="paypal-message" ref={messageElementRef} data-testid="paypal-message"></paypal-message>;
};
