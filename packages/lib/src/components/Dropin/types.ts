import { Order, OrderStatus } from '../../types';
import UIElement from '../UIElement';
import { PaymentMethodsConfiguration, UIElementProps, UIElementStatus } from '../types';
import { NewableComponent } from '../../core/core.registry';

export type InstantPaymentTypes = 'paywithgoogle' | 'googlepay' | 'applepay';

export interface DropinElementProps extends UIElementProps {
    /**
     * Configure each payment method displayed on the Drop-in
     */
    paymentMethodsConfiguration?: PaymentMethodsConfiguration;

    /**
     * Pass the payment method classes that are going to be used as part of the Drop-in.
     */
    paymentMethodComponents?: NewableComponent[];

    order?: Order;

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

    /**
     * Show wallet payment methods to show on top of the regular payment
     * method list.
     *
     * @defaultValue []
     */
    instantPaymentTypes?: InstantPaymentTypes[];

    openFirstStoredPaymentMethod?: boolean;
    openFirstPaymentMethod?: boolean;
    onSubmit?: (data, component) => void;
    onReady?: () => void;
    onSelect?: (paymentMethod: UIElement) => void;

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

export interface onOrderCancelData {
    order: Order;
}

export interface DropinComponentProps extends DropinElementProps {
    onCreateElements: any;
    onChange: (newState?: object) => void;
    onOrderCancel?: (data: onOrderCancelData) => void;
}

interface DropinStatus {
    type: UIElementStatus;
    props?: DropinStatusProps;
}

export interface DropinStatusProps {
    component?: UIElement;
}

export interface DropinComponentState {
    elements: any[];
    instantPaymentElements: UIElement[];
    status: DropinStatus;
    activePaymentMethod: UIElement;
    cachedPaymentMethods: object;
    isDisabling: boolean;
    orderStatus: OrderStatus;
}
