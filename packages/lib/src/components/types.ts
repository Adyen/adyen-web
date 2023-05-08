import { h } from 'preact';
import { Order, PaymentAction, PaymentAmount, PaymentAmountExtended } from '../types';
import Language from '../language/Language';
import UIElement from './UIElement';
import Core from '../core';
import Analytics from '../core/Analytics';
import RiskElement from '../core/RiskModule';
import { PayButtonProps } from './internal/PayButton/PayButton';
import Session from '../core/CheckoutSession';
import { SRPanel } from '../core/Errors/SRPanel';
import { Resources } from '../core/Context/Resources';

export interface PaymentMethodData {
    paymentMethod: {
        [key: string]: any;
        checkoutAttemptId?: string;
    };
    browserInfo?: {
        acceptHeader: string;
        colorDepth: number;
        javaEnabled: boolean;
        language: string;
        screenHeight: number;
        screenWidth: number;
        timeZoneOffset: number;
        userAgent: string;
    };
}

/**
 * Represents the payment data that will be submitted to the /payments endpoint
 */
export interface PaymentData extends PaymentMethodData {
    riskData?: {
        clientData: string;
    };
    order?: {
        orderData: string;
        pspReference: string;
    };
    clientStateDataIndicator: boolean;
    sessionData?: string;
    storePaymentMethod?: boolean;
}

export interface PaymentResponse {
    action?: PaymentAction;
    resultCode: string;
    sessionData?: string;
    order?: Order;
    sessionResult?: string;
}

export interface RawPaymentResponse extends PaymentResponse {
    [key: string]: any;
}

export interface BaseElementProps {
    _parentInstance?: Core;
    order?: Order;
    modules?: {
        srPanel?: SRPanel;
        analytics?: Analytics;
        resources?: Resources;
        risk?: RiskElement;
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
    setElementStatus(status: UIElementStatus, props: any): UIElement;
    setStatus(status: UIElementStatus, props?: { message?: string; [key: string]: any }): UIElement;
    handleAction(action: PaymentAction): UIElement | null;
    showValidation(): void;
    setState(newState: object): void;
}

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';
export type ActionDescriptionType = 'qr-code-loaded' | 'polling-started' | 'fingerprint-iframe-loaded' | 'challenge-iframe-loaded';

export type PayButtonFunctionProps = Omit<PayButtonProps, 'amount'>;

export interface ActionHandledReturnObject {
    componentType: string;
    actionDescription: ActionDescriptionType;
}

export interface UIElementProps extends BaseElementProps {
    environment?: string;
    session?: Session;
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    beforeSubmit?: (state: any, element: UIElement, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element: UIElement) => void;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onError?: (error, element?: UIElement) => void;
    onPaymentCompleted?: (result: any, element: UIElement) => void;
    beforeRedirect?: (resolve, reject, redirectData, element: UIElement) => void;

    isInstantPayment?: boolean;

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

    /**
     *  Set to false to not set the Component status to 'loading' when onSubmit is triggered.
     *  @defaultValue true
     */
    setStatusAutomatically?: boolean;

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
}

// An interface for the members exposed by a component to its parent UIElement
export interface ComponentMethodsRef {
    showValidation?: () => void;
    setStatus?(status: UIElementStatus): void;
}
