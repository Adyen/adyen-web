import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import './GooglePayButton.scss';
import GooglePayAcceleratedService from '../services/GooglePayAcceleratedService';
import { GOOGLE_PAY_ACCELERATED_DIV_ID } from '../GooglePay';

interface Props {
    service: GooglePayAcceleratedService;
}

const GoogleAcceleratedCheckout = ({ service }: Readonly<Props>) => {
    function loadGooglePayIframe() {
        service
            .load()
            .then(data => {
                console.log('[Adyen] Google Pay Accelerated Checkout loaded', data);
            })
            .catch(error => {
                console.error('[Adyen] Google Pay Accelerated Checkout error', error);
            });
    }

    useEffect(() => {
        loadGooglePayIframe();
    }, []);

    return <div id={GOOGLE_PAY_ACCELERATED_DIV_ID} />;
};

export default GoogleAcceleratedCheckout;
