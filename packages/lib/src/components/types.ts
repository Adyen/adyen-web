import { h } from 'preact';
import { Order, PaymentAction, PaymentAmount, PaymentAmountExtended } from '../types';
import Language from '../language/Language';
import UIElement from './UIElement';
import Core from '../core';
import RiskElement from '../core/RiskModule';
import { PayButtonProps } from './internal/PayButton/PayButton';
import Session from '../core/CheckoutSession';
import { SRPanel } from '../core/Errors/SRPanel';
import { Resources } from '../core/Context/Resources';
import { AnalyticsInitialEvent, AnalyticsObject, CreateAnalyticsEventObject, SendAnalyticsObject } from '../core/Analytics/types';
import { EventsQueueModule } from '../core/Analytics/EventsQueue';
import { CbObjOnFocus } from './internal/SecuredFields/lib/types';

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

export type ResultCode =
    | 'AuthenticationFinished'
    | 'AuthenticationNotRequired'
    | 'Authorised'
    | 'Cancelled'
    | 'ChallengeShopper'
    | 'Error'
    | 'IdentifyShopper'
    | 'PartiallyAuthorised'
    | 'Pending'
    | 'PresentToShopper'
    | 'Received'
    | 'RedirectShopper'
    | 'Refused';

export interface OnPaymentCompletedData {
    sessionData: string;
    sessionResult: string;
    resultCode: ResultCode;
}

export interface PaymentResponse {
    action?: PaymentAction;
    resultCode: string;
    sessionData?: string;
    sessionResult?: string;
    order?: Order;
}

export interface RawPaymentResponse extends PaymentResponse {
    [key: string]: any;
}

export interface AnalyticsModule {
    setUp: (a: AnalyticsInitialEvent) => Promise<any>;
    getCheckoutAttemptId: () => string;
    getEventsQueue: () => EventsQueueModule;
    createAnalyticsEvent: (a: CreateAnalyticsEventObject) => AnalyticsObject;
    getEnabled: () => boolean;
    sendAnalytics: (component: string, analyticsObj: SendAnalyticsObject) => void;
}

export interface BaseElementProps {
    _parentInstance?: Core;
    order?: Order;
    modules?: {
        srPanel?: SRPanel;
        analytics?: AnalyticsModule;
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
export type ActionDescriptionType = 'qr-code-loaded' | 'polling-started' | string;

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
    brand?: string;

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

    /**
     * Returned after the payments call, when an action is returned. It represents the payment method tx variant
     * that was used for the payment
     * @internal
     */
    paymentMethodType?: string;

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

export type DecodeObject = {
    success: boolean;
    error?: string;
    data?: string;
};

export type ComponentFocusObject = {
    fieldType: string;
    event: Event | CbObjOnFocus;
};
