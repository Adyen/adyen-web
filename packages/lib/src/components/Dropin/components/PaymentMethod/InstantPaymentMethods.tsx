import { h } from 'preact';
import { memo } from 'preact/compat';
import UIElement from '../../../internal/UIElement/UIElement';
import './InstantPaymentMethods.scss';

interface InstantPaymentMethodsProps {
    paymentMethods: UIElement[];
    onSelect: (paymentMethod: UIElement) => void;
}

const InstantPaymentMethods = memo(({ paymentMethods, onSelect }: InstantPaymentMethodsProps) => {
    return (
        <ul className="adyen-checkout__instant-payment-methods-list">
            {paymentMethods.map(pm => (
                /**
                 * Apple Pay button click event does not bubble up, therefore we need to use 'onClickCapture' here
                 * to capture the button interaction
                 */
                <li key={pm._id} data-testid={pm.type} onClickCapture={() => onSelect(pm)}>
                    {pm.render()}
                </li>
            ))}
        </ul>
    );
});

export { InstantPaymentMethods };
