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
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                <li key={pm._id} data-testid={pm.type} onClick={() => onSelect(pm)}>
                    {pm.render()}
                </li>
            ))}
        </ul>
    );
}

export default InstantPaymentMethods;
