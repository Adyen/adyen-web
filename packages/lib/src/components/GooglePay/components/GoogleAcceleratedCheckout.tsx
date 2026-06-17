import { h } from 'preact';
import { useEffect, useCallback } from 'preact/hooks';
import GoogleAcceleratedCheckoutClient from '../services/GoogleAcceleratedCheckoutClient';
import styles from './GoogleAcceleratedCheckout.module.scss';

export const GOOGLE_PAY_ACCELERATED_DIV_ID = 'adyen-accelerated-checkout-container';

interface Props {
    paymentsClient: GoogleAcceleratedCheckoutClient;
    onFail(): void;
}

const GoogleAcceleratedCheckout = ({ paymentsClient, onFail }: Readonly<Props>) => {
    const loadGooglePayIframe = useCallback(() => {
        paymentsClient
            .load()
            .then(result => {
                if (result.status === 'ERROR') {
                    onFail();
                    return;
                }
                console.log('[Adyen] Google Pay Accelerated Checkout loaded', result);
            })
            .catch(error => {
                console.error('[Adyen] Google Pay Accelerated Checkout error', error);
                onFail();
            });
    }, [paymentsClient, onFail]);

    useEffect(() => {
        loadGooglePayIframe();
    }, [loadGooglePayIframe]);

    return <div id={GOOGLE_PAY_ACCELERATED_DIV_ID} className={styles.iframeContainer} />;
};

export default GoogleAcceleratedCheckout;
