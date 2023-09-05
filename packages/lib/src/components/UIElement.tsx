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
import { Resources } from '../core/Context/Resources';
import { ICore } from '../core/core';

export abstract class UIElement<P extends UIElementProps = any> extends BaseElement<P> implements IUIElement {
    protected componentRef: any;

    protected resources: Resources;

    public elementRef: UIElement;

    public static type = undefined;

    /**
     * Defines all txVariants that the Component supports (in case it support multiple ones besides the 'type' one)
     */
    public static txVariants: string[] = [];

    /**
     * Defines the extra dependencies (Components) that it is needed for the specific UIElement
     * Ex: Card depends on ThreeDS components
     */
    public static dependencies: any[] = []; // FIX type

    constructor(props?: P) {
        super(props);

        if (!this.core.getComponent(this.type)) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                `The component of the type '${this.type}' is not registered in the Core. Make sure to register it before instantiating the Component.`
            );
        }

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
        this.resources = this.props.modules ? this.props.modules.resources : undefined;

        this.storeElementRefOnCore(props);
        this.updatePaymentMethodsConfiguration(props);
    }

    protected storeElementRefOnCore(props?: P) {
        if (!props?.isDropin) {
            this.core.storeElementReference(this);
        }
    }

    protected updatePaymentMethodsConfiguration(props?): void {
        const { core, ...componentProps } = props;
        const hasConfiguration = Object.keys(componentProps).length !== 0;

        if (!props.isDropin && hasConfiguration) {
            this.core.updatePaymentMethodsConfiguration({ [this.type]: componentProps });
        }
    }

    protected override buildElementProps(componentProps: P) {
        const globalCoreProps = this.core.getCorePropsForComponent();
        const paymentMethodsResponseProps = this.core.paymentMethodsResponse.find(this.constructor['type']);

        const finalProps = {
            showPayButton: true,
            setStatusAutomatically: true,
            ...globalCoreProps,
            ...paymentMethodsResponseProps,
            ...componentProps
        };

        this.props = this.formatProps({ ...this.constructor['defaultProps'], ...finalProps });
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
            console.log('### UIElement::onSubmit::  this.elementRef', this.elementRef);
            // Classic flow
            this.props.onSubmit({ data: this.data, isValid: this.isValid }, this.elementRef);
        } else if (this.core.session) {
            // Session flow
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
                .then(data => this.submitPayment(data))
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
        return this.core.session
            .submitPayment(data)
            .then(this.handleResponse)
            .catch(error => this.handleError(error));
    }

    private submitAdditionalDetails(data): Promise<void> {
        return this.core.session.submitDetails(data).then(this.handleResponse).catch(this.handleError);
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

        const paymentAction = this.core.createFromAction(action, {
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
    public updateParent(options: CoreOptions = {}): Promise<ICore> {
        return this.elementRef.core.update(options);
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
        return this.props.icon ?? this.resources.getImage({ loadingContext: this.props.loadingContext })(this.constructor['type']);
    }

    /**
     * Get the element's displayable name
     */
    get displayName(): string {
        const paymentMethodFromResponse = this.core.paymentMethodsResponse.paymentMethods.find(pm => pm.type === this.type);
        return this.props.name || paymentMethodFromResponse?.name || this.type;
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
