import { Order, PaymentAction, PaymentAmount } from '../types';
import Language from '../language/Language';
import UIElement from './UIElement';
import Core from '../core';
import Analytics from '../core/Analytics';
import RiskElement from '../core/RiskModule';

export interface PaymentResponse {
    action?: PaymentAction;
    resultCode: string;
    sessionData?: string;
    order?: Order;
}

export interface RawPaymentResponse extends PaymentResponse {
    [key: string]: any;
}

export interface BaseElementProps {
    _parentInstance?: Core;
    order?: Order;
    modules?: {
        analytics: Analytics;
        risk: RiskElement;
    };
    isDropin?: boolean;
}

export interface IUIElement {
    isValid: boolean;
    displayName: string;
    accessibleName: string;
    type: string;
    elementRef: any;
    submit(): void;
    setStatus(status: UIElementStatus, props?: { message?: string; [key: string]: any }): UIElement;
    handleAction(action: PaymentAction): UIElement | null;
    showValidation(): void;
}

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';

export interface UIElementProps extends BaseElementProps {
    session?: {
        id: string;
        data: string;
    };
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    beforeSubmit?: (state: any, element: UIElement, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element: UIElement) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onError?: (error, element?: UIElement) => void;
    onPaymentCompleted?: (result: any, element: UIElement) => void;
    beforeRedirect?: (resolve, reject, redirectData, element: UIElement) => void;

    isInstantPayment?: boolean;

    type?: string;
    name?: string;
    icon?: string;
    amount?: PaymentAmount;

    /**
     * Show/Hide pay button
     * @defaultValue true
     */
    showPayButton?: boolean;

    /**
     *  Set to false to not set the Component status to 'loading' when onSubmit is triggered.
     *  @defaultValue true
     */
    setStatusAutomatically?: boolean;

    /** @internal */
    payButton?: (options) => any;

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
}
