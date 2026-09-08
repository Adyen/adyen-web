import { h } from 'preact';
import { useRef } from 'preact/hooks';
import UIElement from '../../../internal/UIElement';

interface PaymentMethodDetailsProps {
    paymentMethodComponent: UIElement;
    isSelected: boolean;
}

/**
 * The payment method 'render()' triggers analytics, therefore it must be called only when the payment method gets
 * selected by the shopper. On any other re-render we re-use the vnode created by the previous 'render()' call, so that
 * analytics events aren't duplicated and the Component isn't unmounted (which would reset its state).
 */
const PaymentMethodDetails = ({ paymentMethodComponent, isSelected }: Readonly<PaymentMethodDetailsProps>) => {
    const renderedComponent = useRef<h.JSX.Element>(null);
    const wasSelected = useRef<boolean>(false);

    if (isSelected && !wasSelected.current) {
        renderedComponent.current = paymentMethodComponent.render();
    }
    wasSelected.current = isSelected;

    if (!renderedComponent.current) {
        return null;
    }

    return <div className={'adyen-checkout__payment-method__details__content'}>{renderedComponent.current}</div>;
};

export { PaymentMethodDetails };
