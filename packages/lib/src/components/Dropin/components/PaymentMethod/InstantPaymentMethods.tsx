import { Fragment, h } from 'preact';
import UIElement from '../../../UIElement';

interface InstantPaymentMethodsProps {
    paymentMethods: UIElement[];
}

function InstantPaymentMethods({ paymentMethods }: InstantPaymentMethodsProps) {
    return (
        <Fragment>
            <ul className="adyen-checkout__instant-payment-methods-list">
                {paymentMethods.map(pm => (
                    <li key={pm.type}>{pm.render()}</li>
                ))}
            </ul>
        </Fragment>
    );
}

export default InstantPaymentMethods;
