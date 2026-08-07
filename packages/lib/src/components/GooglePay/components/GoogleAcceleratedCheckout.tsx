import { h } from 'preact';
import { useEffect, useCallback, useState } from 'preact/hooks';
import styles from './GoogleAcceleratedCheckout.module.scss';

import type { IGoogleAcceleratedCheckoutClient, PaymentSheetResize } from '../services/GoogleAcceleratedCheckoutClient';

export const GOOGLE_PAY_ACCELERATED_DIV_ID = 'adyen-accelerated-checkout-container';

interface Props {
    paymentsClient: IGoogleAcceleratedCheckoutClient;
    onFail(): void;
}

const GoogleAcceleratedCheckout = ({ paymentsClient, onFail }: Readonly<Props>) => {
    const [dimensions, setDimensions] = useState<PaymentSheetResize | null>(null);

    const loadGooglePayIframe = useCallback(() => {
        paymentsClient
            .load()
            .then(result => {
                if (result.status === 'ERROR') {
                    onFail();
                }
            })
            .catch(_error => {
                onFail();
            });
    }, [paymentsClient, onFail]);

    useEffect(() => {
        loadGooglePayIframe();
    }, [loadGooglePayIframe]);

    useEffect(() => {
        return paymentsClient.onPaymentSheetResize(setDimensions);
    }, [paymentsClient]);

    return (
        <div
            id={GOOGLE_PAY_ACCELERATED_DIV_ID}
            data-testid={GOOGLE_PAY_ACCELERATED_DIV_ID}
            className={styles.iframeContainer}
            style={dimensions ? { height: dimensions.heightCss } : undefined}
        />
    );
};

export default GoogleAcceleratedCheckout;
