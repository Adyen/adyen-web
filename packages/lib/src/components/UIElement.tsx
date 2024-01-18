import { h } from 'preact';
import BaseElement from './BaseElement';
import { PaymentAction } from '../types';
import { PaymentResponse } from './types';
import PayButton from './internal/PayButton';
import { IUIElement, PayButtonFunctionProps, RawPaymentResponse, UIElementProps } from './types';
import { getSanitizedResponse, resolveFinalResult } from './utils';
import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';
import { UIElementStatus } from './types';
import { hasOwnProperty } from '../utils/hasOwnProperty';
import DropinElement from './Dropin';
import { CoreOptions } from '../core/types';
import Core from '../core';
import {
    ANALYTICS_FOCUS_STR,
    ANALYTICS_RENDERED_STR,
    ANALYTICS_SUBMIT_STR,
    ANALYTICS_UNFOCUS_STR,
    ANALYTICS_VALIDATION_ERROR_STR
} from '../core/Analytics/constants';
import { AnalyticsInitialEvent } from '../core/Analytics/types';

export class UIElement<P extends UIElementProps = any> extends BaseElement<P> implements IUIElement {
    protected componentRef: any;
    public elementRef: UIElement;

    constructor(props: P) {
        super(props);
        this.submit = this.submit.bind(this);
        this.setState = this.setState.bind(this);
        this.onValid = this.onValid.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.setElementStatus = this.setElementStatus.bind(this);

        this.elementRef = (props && props.elementRef) || this;
    }

    public setState(newState: object): void {
        this.state = { ...this.state, ...newState };
        this.onChange();
    }

    protected onChange(): object {
        const isValid = this.isValid;
        const state = { data: this.data, errors: this.state.errors, valid: this.state.valid, isValid };
        if (this.props.onChange) this.props.onChange(state, this.elementRef);
        if (isValid) this.onValid();

        return state;
    }

    // Only called once, for UIElements (including Dropin), as they are being mounted
    protected setUpAnalytics(setUpAnalyticsObj: AnalyticsInitialEvent) {
        const sessionId = this.props.session?.id;

        return this.props.modules.analytics.setUp({
            ...setUpAnalyticsObj,
            ...(sessionId && { sessionId })
        });
    }

    /**
     * A function for all UIElements, or BaseElement, to use to create an analytics action for when it's been:
     *  - mounted,
     *  - a PM has been selected
     *  - onSubmit has been called (as a result of the pay button being pressed)
     *
     *  In some other cases e.g. 3DS2 components, this function is overridden to allow more specific analytics actions to be created
     */
    /* eslint-disable-next-line */
    protected submitAnalytics(analyticsObj: any) {
        /** Work out what the component's "type" is:
         * - first check for a dedicated "analyticsType" (currently only applies to custom-cards)
         * - otherwise, distinguish cards from non-cards: cards will use their static type property, everything else will use props.type
         */
        let component = this.constructor['analyticsType'];
        if (!component) {
            component = this.constructor['type'] === 'scheme' || this.constructor['type'] === 'bcmc' ? this.constructor['type'] : this.props.type;
        }

        const { type, target } = analyticsObj;

        switch (type) {
            // Called from BaseElement (when component mounted) or, from DropinComponent (after mounting, when it has finished resolving all the PM promises)
            // &/or, from DropinComponent when a PM is selected
            case ANALYTICS_RENDERED_STR: {
                let storedCardIndicator;
                // Check if it's a storedCard
                if (component === 'scheme') {
                    if (hasOwnProperty(this.props, 'supportedShopperInteractions')) {
                        storedCardIndicator = {
                            isStoredPaymentMethod: true,
                            brand: this.props.brand
                        };
                    }
                }

                const data = { component, type, ...storedCardIndicator };

                // AnalyticsAction: action: 'event' type:'rendered'|'selected'
                this.props.modules?.analytics.createAnalyticsEvent({
                    event: 'info',
                    data
                });
                break;
            }

            case ANALYTICS_SUBMIT_STR:
                // PM pay button pressed - AnalyticsAction: action: 'log' type:'submit'
                this.props.modules?.analytics.createAnalyticsEvent({
                    event: 'log',
                    data: { component, type, target: 'payButton', message: 'Shopper clicked pay' }
                });
                break;

            case ANALYTICS_FOCUS_STR:
            case ANALYTICS_UNFOCUS_STR:
                this.props.modules?.analytics.createAnalyticsEvent({
                    event: 'info',
                    data: { component, type, target }
                });
                break;

            case ANALYTICS_VALIDATION_ERROR_STR: {
                const { validationErrorCode, validationErrorMessage } = analyticsObj;
                this.props.modules?.analytics.createAnalyticsEvent({
                    event: 'info',
                    data: { component, type, target, validationErrorCode, validationErrorMessage }
                });
                break;
            }

            default: {
                this.props.modules?.analytics.createAnalyticsEvent(analyticsObj);
            }
        }
    }

    private onSubmit(): void {
        //TODO: refactor this, instant payment methods are part of Dropin logic not UIElement
        if (this.props.isInstantPayment) {
            const dropinElementRef = this.elementRef as DropinElement;
            dropinElementRef.closeActivePaymentMethod();
        }

        if (this.props.setStatusAutomatically) {
            this.setElementStatus('loading');
        }

        if (this.props.onSubmit) {
            /** Classic flow */
            // Call analytics endpoint
            this.submitAnalytics({ type: ANALYTICS_SUBMIT_STR });

            // Call onSubmit handler
            this.props.onSubmit({ data: this.data, isValid: this.isValid }, this.elementRef);
        } else if (this._parentInstance.session) {
            /** Session flow */
            // wrap beforeSubmit callback in a promise
            const beforeSubmitEvent = this.props.beforeSubmit
                ? new Promise((resolve, reject) =>
                      this.props.beforeSubmit(this.data, this.elementRef, {
                          resolve,
                          reject
                      })
                  )
                : Promise.resolve(this.data);

            beforeSubmitEvent
                .then(data => {
                    // Call analytics endpoint
                    this.submitAnalytics({ type: ANALYTICS_SUBMIT_STR });
                    // Submit payment
                    return this.submitPayment(data);
                })
                .catch(() => {
                    // set state as ready to submit if the merchant cancels the action
                    this.elementRef.setStatus('ready');
                });
        } else {
            this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Could not submit the payment'));
        }
    }

    private onValid() {
        const state = { data: this.data };
        if (this.props.onValid) this.props.onValid(state, this.elementRef);
        return state;
    }

    onComplete(state): void {
        if (this.props.onComplete) this.props.onComplete(state, this.elementRef);
    }

    /**
     * Submit payment method data. If the form is not valid, it will trigger validation.
     */
    public submit(): void {
        if (!this.isValid) {
            this.showValidation();
            return;
        }

        this.onSubmit();
    }

    public showValidation(): this {
        if (this.componentRef && this.componentRef.showValidation) this.componentRef.showValidation();
        return this;
    }

    public setElementStatus(status: UIElementStatus, props?: any): this {
        this.elementRef?.setStatus(status, props);
        return this;
    }

    public setStatus(status: UIElementStatus, props?): this {
        if (this.componentRef?.setStatus) {
            this.componentRef.setStatus(status, props);
        }
        return this;
    }

    private submitPayment(data): Promise<void> {
        return this._parentInstance.session
            .submitPayment(data)
            .then(this.handleResponse)
            .catch(error => this.handleError(error));
    }

    private submitAdditionalDetails(data): Promise<void> {
        return this._parentInstance.session.submitDetails(data).then(this.handleResponse).catch(this.handleError);
    }

    protected handleError = (error: AdyenCheckoutError): void => {
        /**
         * Set status using elementRef, which:
         * - If Drop-in, will set status for Dropin component, and then it will propagate the new status for the active payment method component
         * - If Component, it will set its own status
         */
        this.setElementStatus('ready');

        if (this.props.onError) {
            this.props.onError(error, this.elementRef);
        }
    };

    protected handleAdditionalDetails = state => {
        if (this.props.onAdditionalDetails) {
            this.props.onAdditionalDetails(state, this.elementRef);
        } else if (this.props.session) {
            this.submitAdditionalDetails(state.data);
        }

        return state;
    };

    public handleAction(action: PaymentAction, props = {}): UIElement | null {
        if (!action || !action.type) {
            if (hasOwnProperty(action, 'action') && hasOwnProperty(action, 'resultCode')) {
                throw new Error(
                    'handleAction::Invalid Action - the passed action object itself has an "action" property and ' +
                        'a "resultCode": have you passed in the whole response object by mistake?'
                );
            }
            throw new Error('handleAction::Invalid Action - the passed action object does not have a "type" property');
        }

        const paymentAction = this._parentInstance.createFromAction(action, {
            ...this.elementRef.props,
            ...props,
            onAdditionalDetails: this.handleAdditionalDetails
        });

        if (paymentAction) {
            this.unmount();
            return paymentAction.mount(this._node);
        }

        return null;
    }

    protected handleOrder = (response: PaymentResponse): void => {
        this.updateParent({ order: response.order });
        // in case we receive an order in any other component then a GiftCard trigger handleFinalResult
        if (this.props.onPaymentCompleted) this.props.onPaymentCompleted(response, this.elementRef);
    };

    protected handleFinalResult = (result: PaymentResponse) => {
        if (this.props.setStatusAutomatically) {
            const [status, statusProps] = resolveFinalResult(result);
            if (status) this.setElementStatus(status, statusProps);
        }

        if (this.props.onPaymentCompleted) this.props.onPaymentCompleted(result, this.elementRef);
        return result;
    };

    /**
     * Handles a session /payments or /payments/details response.
     * The component will handle automatically actions, orders, and final results.
     * @param rawResponse -
     */
    protected handleResponse(rawResponse: RawPaymentResponse): void {
        const response = getSanitizedResponse(rawResponse);

        if (response.action) {
            this.elementRef.handleAction(response.action);
        } else if (response.order?.remainingAmount?.value > 0) {
            // we don't want to call elementRef here, use the component handler
            // we do this way so the logic on handlingOrder is associated with payment method
            this.handleOrder(response);
        } else {
            this.elementRef.handleFinalResult(response);
        }
    }

    /**
     * Call update on parent instance
     * This function exist to make safe access to the protect _parentInstance
     * @param options - CoreOptions
     */
    public updateParent(options: CoreOptions = {}): Promise<Core> {
        return this.elementRef._parentInstance.update(options);
    }

    public setComponentRef = ref => {
        this.componentRef = ref;
    };

    /**
     * Get the current validation status of the element
     */
    get isValid(): boolean {
        return false;
    }

    /**
     * Get the element icon URL for the current environment
     */
    get icon(): string {
        const type = this.props.paymentMethodType || this.type;
        return this.props.icon ?? this.resources.getImage()(type);
    }

    /**
     * Get the element's displayable name
     */
    get displayName(): string {
        return this.props.name || this.constructor['type'];
    }

    /**
     * Get the element accessible name, used in the aria-label of the button that controls selected payment method
     */
    get accessibleName(): string {
        return this.displayName;
    }

    /**
     * Return the type of an element
     */
    get type(): string {
        return this.props.type || this.constructor['type'];
    }

    /**
     * Get the payButton component for the current element
     */
    protected payButton = (props: PayButtonFunctionProps) => {
        return <PayButton {...props} amount={this.props.amount} secondaryAmount={this.props.secondaryAmount} onClick={this.submit} />;
    };
}

export default UIElement;
