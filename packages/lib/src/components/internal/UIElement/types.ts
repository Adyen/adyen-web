import { h } from 'preact';
import Session from '../../../core/CheckoutSession';
import Language from '../../../language';
import UIElement from './UIElement';
import type { PaymentAction, PaymentAmount, PaymentAmountExtended } from '../../../types/global-types';
import type { BaseElementProps } from '../BaseElement/types';
import type { PayButtonProps } from '../PayButton/PayButton';
import type { CoreConfiguration } from '../../../core/types';

export type PayButtonFunctionProps = Omit<PayButtonProps, 'amount'>;

type CoreCallbacks = Pick<
    CoreConfiguration,
    | 'beforeRedirect'
    | 'beforeSubmit'
    | 'onSubmit'
    | 'onAdditionalDetails'
    | 'onPaymentFailed'
    | 'onPaymentCompleted'
    | 'onOrderUpdated'
    | 'onPaymentMethodsRequest'
    | 'onChange'
    | 'onActionHandled'
    | 'onError'
    | 'onEnterKeyPressed'
>;

export type StatusFromAction = 'redirect' | 'loading' | 'custom';

export type UIElementProps = BaseElementProps &
    CoreCallbacks & {
        environment?: string;
        session?: Session;

        onComplete?: (state, element: UIElement) => void;

        isInstantPayment?: boolean;

        /**
         * Flags if the element is Stored payment method
         * @internal
         */
        isStoredPaymentMethod?: boolean;

        /**
         * Flag if the element is Stored payment method.
         * Perhaps can be deprecated and we use the one above?
         * @internal
         */
        oneClick?: boolean;

        /**
         * Stored payment method id
         * @internal
         */
        storedPaymentMethodId?: string;

        /**
         * Status set when creating the Component from action
         * @internal
         */
        statusType?: StatusFromAction;

        type?: string;
        name?: string;
        icon?: string;
        amount?: PaymentAmount;
        secondaryAmount?: PaymentAmountExtended;

        /**
         * Show/Hide pay button
         * @defaultValue true
         */
        showPayButton?: boolean;

        /** @internal */
        payButton?: (options: PayButtonFunctionProps) => h.JSX.Element;

        /** @internal */
        loadingContext?: string;

        /** @internal */
        createFromAction?: (action: PaymentAction, props: object) => UIElement;

        /** @internal */
        clientKey?: string;

        /** @internal */
        elementRef?: any;

        /** @internal */
        i18n?: Language;

        /**
         * The shopper’s issuer account label. It can be available for stored payment method
         * @internal
         */
        label?: string;

        /**
         * Returned after the payments call, when an action is returned. It represents the payment method tx variant
         * that was used for the payment
         * @internal
         */
        paymentMethodType?: string;

        /**
         * Reference to the action object found in a /payments response. This, in most cases, is passed on to the onActionHandled callback
         */
        originalAction?: PaymentAction;
    };

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';

// An interface for the members exposed by a component to its parent UIElement
export interface ComponentMethodsRef {
    showValidation?: () => void;
    setStatus?(status: UIElementStatus): void;
}
