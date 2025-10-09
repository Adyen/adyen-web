import { h } from 'preact';
import UIElement from '../../../internal/UIElement/UIElement';
import './InstantPaymentMethods.scss';

interface InstantPaymentMethodsProps {
    paymentMethods: UIElement[];
    onSelect: (paymentMethod: UIElement) => void;
}

function InstantPaymentMethods({ paymentMethods, onSelect }: InstantPaymentMethodsProps) {
    return (
        <ul className="adyen-checkout__instant-payment-methods-list">
            {paymentMethods.map(pm => (
                <li key={pm._id} data-testid={pm.type} onClickCapture={() => onSelect(pm)}>
                    {pm.render()}
                </li>
            ))}
        </ul>
    );
}

export default InstantPaymentMethods;
