import { h } from 'preact';

import Spinner from '../../internal/Spinner';

export const PayPalSpinner = () => {
    return (
        <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--pending" data-testid="paypal-loader">
            <Spinner />
        </div>
    );
};
