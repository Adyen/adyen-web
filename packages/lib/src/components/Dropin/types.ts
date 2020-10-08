import { PaymentMethod, StoredPaymentMethod, PaymentMethods, PaymentMethodOptions, Order } from '../../types';
import { UIElementProps } from '../UIElement';

export interface DropinElementProps extends UIElementProps {
    /**
     * Configure each payment method displayed on the Drop-in
     */
    paymentMethodsConfiguration?: {
        [key in keyof PaymentMethods]?: Partial<PaymentMethodOptions<key>>;
    };

    paymentMethods?: PaymentMethod[];

    storedPaymentMethods?: StoredPaymentMethod[];

    order: Order;

    /**
     * Show/Hide stored payment methods
     * @defaultValue true
     */
    showStoredPaymentMethods?: boolean;

    /**
     * Show/Hide regular (non-stored) payment methods
     * @defaultValue true
     */
    showPaymentMethods?: boolean;

    openFirstStoredPaymentMethod?: boolean;
    openFirstPaymentMethod?: boolean;
    onSubmit?: (data, component) => void;
    onReady?: () => void;
    onSelect?: (paymentMethod) => void;

    /**
     * Show/Hide the remove payment method button on stored payment methods
     * Requires {@link DropinElementProps.onDisableStoredPaymentMethod}
     * @defaultValue false
     */
    showRemovePaymentMethodButton?: boolean;

    /**
     * Called when a shopper clicks Remove on a stored payment method
     * Use this to call the {@link https://docs.adyen.com/api-explorer/#/Recurring/v49/post/disable /disable endpoint}
     * Call resolve() if the removal was successful, or call reject() if there was an error
     * @defaultValue false
     */
    onDisableStoredPaymentMethod?: (storedPaymentMethod, resolve, reject) => void;
}

export interface DropinComponentProps extends DropinElementProps {
    onChange: (newState?: object) => void;
    onOrderCancel?: (order: Order) => void;
}
