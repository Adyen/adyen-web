import { PaymentMethod, StoredPaymentMethod } from '../../types';
import { UIElementProps } from '../UIElement';
import paymentMethods from '../index';

type PaymentMethods = typeof paymentMethods;
type PaymentMethodOptions<P extends keyof PaymentMethods> = InstanceType<PaymentMethods[P]>['props'];

export interface DropinElementProps extends UIElementProps {
    /**
     * Configure each payment method displayed on the Drop-in
     * @default {}
     */
    paymentMethodsConfiguration?: {
        [key in keyof PaymentMethods]?: Partial<PaymentMethodOptions<key>>;
    };

    paymentMethods?: PaymentMethod[];

    storedPaymentMethods?: StoredPaymentMethod[];

    /**
     * Show/Hide stored payment methods
     * @default true
     */
    showStoredPaymentMethods?: boolean;

    /**
     * Show/Hide regular (non-stored) payment methods
     * @default true
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
     * @default false
     */
    showRemovePaymentMethodButton?: boolean;

    /**
     * Called when a shopper clicks Remove on a stored payment method
     * Use this to call the {@link https://docs.adyen.com/api-explorer/#/Recurring/v49/post/disable /disable endpoint}
     * Call resolve() if the removal was successful, or call reject() if there was an error
     * @default false
     */
    onDisableStoredPaymentMethod?: (storedPaymentMethod, resolve, reject) => void;
}

export interface DropinComponentProps extends DropinElementProps {
    onChange: (newState?: object) => void;
}
