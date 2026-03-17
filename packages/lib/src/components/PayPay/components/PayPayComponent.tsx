import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import PayPayService from '../services/PayPayService';

type PayPayComponentProps = {
    service: PayPayService;
};

function PayPayComponent({ service }: Readonly<PayPayComponentProps>) {
    useEffect(() => {
        service.initialize({ containerId: 'adyen-checkout-paypay' });
    }, [service]);

    return <div id="adyen-checkout-paypay"></div>;
}

export default PayPayComponent;
