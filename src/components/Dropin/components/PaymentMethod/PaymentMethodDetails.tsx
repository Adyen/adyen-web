import { h } from 'preact';

const PaymentMethodDetails = ({ paymentMethodComponent, isLoaded }) => {
    if (paymentMethodComponent && isLoaded) {
        return <div className={'adyen-checkout__payment-method__details__content'}>{paymentMethodComponent}</div>;
    }

    return null;
};

export default PaymentMethodDetails;
