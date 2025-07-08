import type { Order, OrderStatus, PaymentActionsType, PaymentAmount, StoredPaymentMethod } from '../../types/global-types';
import { StatusFromAction, UIElementProps, UIElementStatus } from '../internal/UIElement/types';
import type { NewableComponent } from '../../core/core.registry';
import type { ICore } from '../../core/types';

import UIElement from '../internal/UIElement/UIElement';
import { ComponentsMap } from '../components-map';

/**
 * Available components
 */
export type PaymentMethods = typeof ComponentsMap;

/**
 * Options for a component
 */
export type PaymentMethodOptions<P extends keyof PaymentMethods> = InstanceType<PaymentMethods[P]>['props'];

type PaymentMethodsConfigurationMap = {
    [key in keyof PaymentMethods]?: Partial<PaymentMethodOptions<key>>;
};
type PaymentActionTypesMap = {
    [key in PaymentActionsType]?: Partial<UIElementProps>;
};
/**
 * Type must be loose, otherwise it will take priority over the rest
 */
type NonMappedPaymentMethodsMap = {
    [key: string]: any;
};

export type PaymentMethodsConfiguration = PaymentMethodsConfigurationMap & PaymentActionTypesMap & NonMappedPaymentMethodsMap;

export type InstantPaymentTypes = 'paywithgoogle' | 'googlepay' | 'applepay';

export interface DropinConfiguration extends UIElementProps {
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
     * Disable the final animation when the payment is successful or if it fails.
     * @defaultValue false
     */
    disableFinalAnimation?: boolean;

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

    /**
     * Pre-select a specific payment method when Drop-in is rendered
     *
     * @default undefined
     */
    openPaymentMethod?: {
        type: string;
    };

    /**
     * Pre-select the first stored payment method.
     * It has priority over 'openFirstPaymentMethod' property
     *
     * @default true
     */
    openFirstStoredPaymentMethod?: boolean;

    /**
     * Pre-select the first non-stored payment method.
     * 'openFirstStoredPaymentMethod' has priority over this property
     *
     * @default true
     */
    openFirstPaymentMethod?: boolean;

    /**
     * Callback triggered once the Drop-in is ready to be used
     */
    onReady?(): void;

    /**
     * Callback triggered before Drop-in creates the stored payment method UIElements.
     * This callback lets you choose which saved payment methods appear in the Drop-in.
     */
    filterStoredPaymentMethods?(storedPaymentMethods: StoredPaymentMethod[]): StoredPaymentMethod[];

    /**
     * Callback triggered once the shopper selects a different payment method in the Drop-in
     */
    onSelect?(paymentMethod: UIElement): void;

    /**
     * Show/Hide the remove payment method button on stored payment methods
     * Requires {@link DropinConfiguration.onDisableStoredPaymentMethod}
     * @defaultValue false
     */
    showRemovePaymentMethodButton?: boolean;

    /**
     * Show/Hide the radio in the payment method list
     * @defaultValue false
     */
    showRadioButton?: boolean;

    /**
     * Called when a shopper clicks Remove on a stored payment method
     * Use this to call the {@link https://docs.adyen.com/api-explorer/#/Recurring/v49/post/disable /disable endpoint}
     * Call resolve() if the removal was successful, or call reject() if there was an error
     * @defaultValue false
     */
    onDisableStoredPaymentMethod?: (storedPaymentMethod, resolve, reject) => void;
}

export interface onOrderCancelData {
    order: {
        orderData: string;
        pspReference: string;
    };
}

export type onOrderCancelType = (
    data: onOrderCancelData,
    actions: {
        resolve: (data: { amount: PaymentAmount }) => void;
        reject: (error: string) => void;
    }
) => void;

export interface DropinComponentProps extends DropinConfiguration {
    core: ICore;
    onCreateElements(): any;
    onOrderCancel?: onOrderCancelType;
}

export interface DropinStatus {
    type: UIElementStatus | StatusFromAction;
    props?: DropinStatusProps;
}

export interface DropinStatusProps {
    component?: UIElement;
    message?: string;
}

export interface DropinComponentState {
    elements: UIElement[];
    fastlanePaymentElement: UIElement[];
    instantPaymentElements: UIElement[];
    storedPaymentElements: UIElement[];
    status: DropinStatus;
    activePaymentMethod: UIElement;
    cachedPaymentMethods: Record<string, boolean>;
    showDefaultPaymentMethodList: boolean;
    isDisabling: boolean;
    orderStatus: OrderStatus;
}

export interface IDropin {
    /**
     * Used to make the Dropin display the final animation
     *
     * @internal
     * @param type - animation type
     */
    displayFinalAnimation(type: 'success' | 'error'): void;
    activePaymentMethod: () => null;
    closeActivePaymentMethod: () => void;
}
