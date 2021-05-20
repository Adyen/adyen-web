import { Order, PaymentAction, PaymentAmount } from '../types';
import Language from '../language/Language';
import UIElement from './UIElement';
import Core from '../core';
import Analytics from '../core/Analytics';
import RiskElement from '../core/RiskModule';
import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';

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

export interface UIElementProps extends BaseElementProps {
    session?: {
        id: string;
        data: string;
    };
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element: UIElement) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onError?: (error, element?: UIElement) => void;
    onPaymentCompleted?: (result: any, element: UIElement) => void;
    beforeRedirect?: (resolve, reject, redirectData, element: UIElement) => void;

    name?: string;
    icon?: string;
    amount?: PaymentAmount;

    /**
     * Show/Hide pay button
     * @defaultValue true
     */
    showPayButton?: boolean;

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
