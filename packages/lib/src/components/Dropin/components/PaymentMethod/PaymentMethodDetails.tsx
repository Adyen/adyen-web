import { h } from 'preact';
import { memo } from 'preact/compat';
import UIElement from '../../../internal/UIElement';

interface PaymentMethodDetailsProps {
    paymentMethodComponent: UIElement;
    isSelected: boolean;
}

/**
 * The payment method 'render()' trigger analytics. If a Component is removed from the DOM, the state is reset.
 * In order to preserve the state and also trigger analytics when a Component is selected, we cache renders when
 * the 'isSelect' changes from true -> false
 */
function isComponentCached(oldProps: PaymentMethodDetailsProps, newProps: PaymentMethodDetailsProps) {
    const isInitialRender = oldProps.isSelected === null;

    if (isInitialRender) return false;

    const componentIsDeselected = oldProps.isSelected === true && newProps.isSelected === false;
    return componentIsDeselected;
}

const PaymentMethodDetails = memo(({ paymentMethodComponent, isSelected }: PaymentMethodDetailsProps) => {
    if (!isSelected) {
        return null;
    }

    return <div className={'adyen-checkout__payment-method__details__content'}>{paymentMethodComponent.render()}</div>;
}, isComponentCached);

export { PaymentMethodDetails };
