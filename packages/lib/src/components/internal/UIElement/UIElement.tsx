import { h } from 'preact';
import BaseElement from '../BaseElement/BaseElement';
import PayButton from '../PayButton';
import { assertIsDropin, cleanupFinalResult, getRegulatoryDefaults, sanitizeResponse, verifyPaymentDidNotFail } from './utils';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { hasOwnProperty } from '../../../utils/hasOwnProperty';
import { Resources } from '../../../core/Context/Resources';
import { ANALYTICS_SUBMIT_STR } from '../../../core/Analytics/constants';

import type { AnalyticsInitialEvent, SendAnalyticsObject } from '../../../core/Analytics/types';
import type { CoreConfiguration, ICore, AdditionalDetailsData, OnKeyPressedObject } from '../../../core/types';
import type { ComponentMethodsRef, PayButtonFunctionProps, UIElementProps, UIElementStatus } from './types';
import type { CheckoutSessionDetailsResponse, CheckoutSessionPaymentResponse } from '../../../core/CheckoutSession/types';
import type {
    CheckoutAdvancedFlowResponse,
    Order,
    PaymentAction,
    PaymentAmount,
    PaymentData,
    PaymentMethodsResponse,
    PaymentResponseData,
    RawPaymentResponse
} from '../../../types/global-types';
import type { IDropin } from '../../Dropin/types';
import type { NewableComponent } from '../../../core/core.registry';

import './UIElement.scss';

export abstract class UIElement<P extends UIElementProps = UIElementProps> extends BaseElement<P> {
    protected componentRef: any;

    protected resources: Resources;

    public elementRef: UIElement;

    public static type = undefined;

    /**
     * Defines all txVariants that the Component supports (in case it support multiple ones besides the 'type' one)
     */
    public static txVariants: string[] = [];

    constructor(checkout: ICore, props?: P) {
        super(checkout, props);

        this.core.register(this.constructor as NewableComponent);

        this.submit = this.submit.bind(this);
        this.setState = this.setState.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleAdditionalDetails = this.handleAdditionalDetails.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.setElementStatus = this.setElementStatus.bind(this);
        this.submitAnalytics = this.submitAnalytics.bind(this);
        this.makePaymentsCall = this.makePaymentsCall.bind(this);
        this.makeAdditionalDetailsCall = this.makeAdditionalDetailsCall.bind(this);
        this.submitUsingSessionsFlow = this.submitUsingSessionsFlow.bind(this);

        this.elementRef = (props && props.elementRef) || this;
        this.resources = this.props.modules ? this.props.modules.resources : undefined;

        this.storeElementRefOnCore(this.props);

        this.onEnterKeyPressed = this.onEnterKeyPressed.bind(this);
    }

    protected override buildElementProps(componentProps?: P) {
        const globalCoreProps = this.core.getCorePropsForComponent();
        const isStoredPaymentMethod = !!componentProps?.isStoredPaymentMethod;
        const paymentMethodsResponseProps = isStoredPaymentMethod
            ? {}
            : this.core.paymentMethodsResponse.find(componentProps?.type || this.constructor['type']);

        const finalProps = {
            showPayButton: true,
            ...globalCoreProps,
            ...paymentMethodsResponseProps,
            ...componentProps
        };

        const isDropin = assertIsDropin(this as unknown as IDropin);

        this.props = this.formatProps({
            ...this.constructor['defaultProps'], // component defaults
            ...getRegulatoryDefaults(this.core.options.countryCode, isDropin), // regulatory defaults
            ...finalProps // the rest (inc. merchant defined config)
        });
    }

    protected storeElementRefOnCore(props?: P) {
        if (!props?.isDropin) {
            this.core.storeElementReference(this);
        }
    }

    public isAvailable(): Promise<void> {
        return Promise.resolve();
    }

    public setState(newState: object): void {
        this.state = { ...this.state, ...newState };
        this.onChange();
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

    protected onChange(): void {
        this.props.onChange?.(
            {
                data: this.data,
                isValid: this.isValid,
                errors: this.state.errors,
                valid: this.state.valid
            },
            this.elementRef
        );
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
    protected submitAnalytics(analyticsObj: SendAnalyticsObject, uiElementProps?) {
        /** Work out what the component's "type" is:
         * - first check for a dedicated "analyticsType" (currently only applies to custom-cards)
         * - otherwise, distinguish cards from non-cards: cards will use their static type property, everything else will use props.type
         */
        try {
            let component = this.constructor['analyticsType'];
            if (!component) {
                component = this.constructor['type'] === 'scheme' || this.constructor['type'] === 'bcmc' ? this.constructor['type'] : this.props.type;
            }

            this.props.modules.analytics.sendAnalytics(component, analyticsObj, uiElementProps);
        } catch (error) {
            console.warn('Failed to submit the analytics event. Error:', error);
        }
    }

    public submit(): void {
        if (!this.isValid) {
            this.showValidation();
            return;
        }

        this.makePaymentsCall().then(sanitizeResponse).then(verifyPaymentDidNotFail).then(this.handleResponse).catch(this.handleFailedResult);
    }

    protected makePaymentsCall(): Promise<CheckoutAdvancedFlowResponse | CheckoutSessionPaymentResponse> {
        this.setElementStatus('loading');

        if (this.props.onSubmit) {
            return this.submitUsingAdvancedFlow();
        }

        if (this.core.session) {
            const beforeSubmitEvent: Promise<PaymentData> = this.props.beforeSubmit
                ? new Promise((resolve, reject) =>
                      this.props.beforeSubmit(this.data, this.elementRef, {
                          resolve,
                          reject
                      })
                  )
                : Promise.resolve(this.data);

            return beforeSubmitEvent.then(this.submitUsingSessionsFlow);
        }

        this.handleError(
            new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'It can not perform /payments call. Callback "onSubmit" is missing or Checkout session is not available'
            )
        );
    }

    private async submitUsingAdvancedFlow(): Promise<CheckoutAdvancedFlowResponse> {
        return new Promise<CheckoutAdvancedFlowResponse>((resolve, reject) => {
            // Call analytics endpoint
            this.submitAnalytics({ type: ANALYTICS_SUBMIT_STR });

            this.props.onSubmit(
                {
                    data: this.data,
                    isValid: this.isValid
                },
                this.elementRef,
                { resolve, reject }
            );
        });
    }

    private async submitUsingSessionsFlow(data: PaymentData): Promise<CheckoutSessionPaymentResponse> {
        this.submitAnalytics({ type: ANALYTICS_SUBMIT_STR });

        try {
            return await this.core.session.submitPayment(data);
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) this.handleError(error);
            else this.handleError(new AdyenCheckoutError('ERROR', 'Error when making /payments call', { cause: error }));

            return Promise.reject(error);
        }

        // // Uncomment to simulate failed
        // return {
        //     resultCode: 'Refused',
        //     sessionData:
        //         'Ab02b4c0!BQABAgBKGgqfEz8uQlU4yCIOWjA8bkEwmbJ7Qt4r+x5IPXREu1rMjwNk5MDoHFNlv+MWvinS6nXIDniXgRzXCdSC4ksw9CNDBAjOa+B88wRoj/rLTieuWh/0leR88qkV24vtIkjsIsbJTDB78Pd8wX8MEDsXhaAdEIyX9E8eqxuQ3bwPbvLs1Dlgo1ZrfkQRzaNiuVM8ejRG0IWE1bGThJzY+sJvZZHvlDMXIlxhZcDoQvsMj/WwE6+nFJxBiC3oRzmvVn3AbkLQGtvwq16UUSfYbPzG9dXypJMtcrZAQYq2g/2+BSibCcmee9AXq/wij11BERrYmjbDt5NkkdUnDVgAB7pdqbnWX0A2sxBKeYtLSP2kxp+5LoU/Wty3fmcVA3VKVkHfgmIihkeL8lY++5hvHjnkzOE4tyx/sheiKS4zqoWE43TD6n8mpFskAzwMHq4G2o6vkXqvaKFEq7y/R2fVrCypenmRhkPASizpM265rKLU+L4E/C+LMHfN0LYKRMCrLr0gI2GAp+1PZLHgh0tCtiJC/zcJJtJs6sHNQxLUN+kxJuELUHOcuL3ivjG+mWteUnBENZu7KqOSZYetiWYRiyLOXDiBHqbxuQwTuO54L15VLkS/mYB20etibM1nn+fRmbo+1IJkCSalhwi5D7fSrpjbQTmAsOpJT1N8lC1MSNmAvAwG1kWL4JxYwXDKYyYASnsia2V5IjoiQUYwQUFBMTAzQ0E1MzdFQUVEODdDMjRERDUzOTA5QjgwQTc4QTkyM0UzODIzRDY4REFDQzk0QjlGRjgzMDVEQyJ98uZI4thGveOByYbomCeeP2Gy2rzs99FOBoDYVeWIUjyM+gfnW89DdJZAhxe74Tv0TnL5DRQYPCTRQPOoLbQ21NaeSho70FNE+n8XYKlVK5Ore6BoB6IVCaal5MkM27VmZPMmGflgcPx+pakx+EmRsYGdvYNImYxJYrRk3CI+l3T3ZiVpPPqebaVSLaSkEfu0iOFPjjLUhWN6QW6c18heE5vq/pcoeBf7p0Jgr9I5aBFY0avYG57BDGHzU1ZiQ9LLMTis2BA7Ap9pdNq8FVXL4fnoVHNZiiANOf3uvSknPKBID8sdOXUStA0crmO322FYjDqh1n6FG+D7+OJSayNsXIz6Zoy0eFn4HbT8nt8L2X2tdzkMayCYHXRwKh13Xyleqxt4WoEZmhwTmB3p9d1F0SylWnjcC6o/DnshJ9mMW/8D3oWS30Z7BwRODqKGVahRD0YGRzwMbVnEe5JFRfNvJZdLGl35L9632DVmuFQ0lr/8WNL/NrAJNtI6PXrZMNiza0/omPwPfe5ZYuD1Jgq59TX4h9d+3fdkArcJYL7AdoMZON1YEiWY5EzazQwtHd9yzdty9ZHPxAfuOfCh4OhbhFNp+v5YQ+PzKZ+UpM1VxV863+9XgWEURPNvX7qq1cpUSRzrSGq01QBBM3MKzRh5mAgqIdXgtl7L0EXAep0MECc7QY0/o3tW3VR8eEJGsSzrNxpFItqj0SEaIWo25dRfkl5zuw47GQrN9Qzxl2WV3A38MQPUqFtIr/71Rjkphgg49ZGWEYCwgFmm8jJc2/5qTabSGk4bzwiETCTzeydq30bUGqCwglj8CrFViAuQeTJm7dp+PYKMkUNvQRpnSXMj6Kz7rvAMzhzJgK62ltN2idqKxLC7WtivCUgejuQUvNreCYBQCaKwTwP02lZsJpGF9yw8gbyuoB+2aB7IZmgIB8GP4qVQ/ht5B9z/FLohK/8cSPV/4i32SNNdcwhV',
        //     sessionResult:
        //         'X3XtfGC7!H4sIAAAAAAAA/6tWykxRslJyDjaxNDMyM3E2MXIyNDUys3RU0lHKTS1KzkjMK3FMTs4vzSsBKgtJLS7xhYo6Z6QmZ+eXlgAVFpcklpQWA+WLUtNKi1NTlGoBMEEbz1cAAAA=iMsCaEJ5LcnsqIUtmNxjm8HtfQ8gZW8JewEU3wHz4qg='
        // };
    }

    protected onComplete(state): void {
        if (this.props.onComplete) this.props.onComplete(state, this.elementRef);
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

    protected handleAdditionalDetails(state: AdditionalDetailsData): void {
        this.makeAdditionalDetailsCall(state)
            .then(sanitizeResponse)
            .then(verifyPaymentDidNotFail)
            .then(this.handleResponse)
            .catch(this.handleFailedResult);
    }

    private makeAdditionalDetailsCall(state: AdditionalDetailsData): Promise<CheckoutSessionDetailsResponse | CheckoutAdvancedFlowResponse> {
        if (this.props.onAdditionalDetails) {
            return new Promise<CheckoutAdvancedFlowResponse>((resolve, reject) => {
                this.props.onAdditionalDetails(state, this.elementRef, { resolve, reject });
            });
        }

        if (this.core.session) {
            return this.submitAdditionalDetailsUsingSessionsFlow(state.data);
        }

        this.handleError(
            new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'It can not perform /payments/details call. Callback "onAdditionalDetails" is missing or Checkout session is not available'
            )
        );
    }

    private async submitAdditionalDetailsUsingSessionsFlow(data: any): Promise<CheckoutSessionDetailsResponse> {
        try {
            return await this.core.session.submitDetails(data);
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) this.handleError(error);
            else this.handleError(new AdyenCheckoutError('ERROR', 'Error when making /details call', { cause: error }));

            return Promise.reject(error);
        }
    }

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

    protected handleOrder = (response: PaymentResponseData): void => {
        const { order } = response;

        const updateCorePromise = this.core.session ? this.core.update({ order }) : this.handleAdvanceFlowPaymentMethodsUpdate(order);

        updateCorePromise.then(() => {
            this.props.onOrderUpdated?.({ order });
        });
    };

    /**
     * Handles when the payment fails. The payment fails when:
     * - adv flow: the merchant rejects the payment due to a critical error
     * - adv flow: the merchant resolves the payment with a failed resultCode
     * - sessions: a network error occurs when making the payment
     * - sessions: the payment fails with a failed resultCode
     *
     * @param result
     */
    protected handleFailedResult = (result?: PaymentResponseData): void => {
        if (assertIsDropin(this.elementRef)) {
            this.elementRef.displayFinalAnimation('error');
        }

        cleanupFinalResult(result);
        this.props.onPaymentFailed?.(result, this.elementRef);
    };

    protected handleSuccessResult = (result: PaymentResponseData): void => {
        if (assertIsDropin(this.elementRef)) {
            this.elementRef.displayFinalAnimation('success');
        }

        cleanupFinalResult(result);
        this.props.onPaymentCompleted?.(result, this.elementRef);
    };

    /**
     * Handles a session /payments or /payments/details response.
     * The component will handle automatically actions, orders, and final results.
     *
     * @param rawResponse -
     */
    protected handleResponse(rawResponse: RawPaymentResponse): void {
        const response = sanitizeResponse(rawResponse);

        if (response.action) {
            this.elementRef.handleAction(response.action);
            return;
        }

        if (response.order?.remainingAmount?.value > 0) {
            // we don't want to call elementRef here, use the component handler
            // we do this way so the logic on handlingOrder is associated with payment method
            this.handleOrder(response);
            return;
        }

        this.handleSuccessResult(response);
    }

    protected handleKeyPress(e: h.JSX.TargetedKeyboardEvent<HTMLInputElement> | KeyboardEvent) {
        if (e.key === 'Enter' || e.code === 'Enter') {
            e.preventDefault(); // Prevent <form> submission if Component is placed inside a form

            this.onEnterKeyPressed({ component: this, activeElement: document?.activeElement });
        }
    }

    /**
     * Handle Enter key pressed from a UIElement (called via handleKeyPress)
     * @param obj
     */
    protected onEnterKeyPressed(obj: OnKeyPressedObject) {
        console.log('### UIElement::onEnterKeyPressed::obj ', obj);
        if (this.props.onEnterKeyPressed) {
            this.props.onEnterKeyPressed(obj);
        } else {
            (obj.activeElement as HTMLElement).blur();
            this.submit();
        }
    }

    /**
     * Call update on parent instance
     * This function exist to make safe access to the protected _parentInstance
     * @param options - CoreOptions
     */
    public updateParent(options: CoreConfiguration = {}): Promise<ICore> {
        return this.elementRef.core.update(options);
    }

    public setComponentRef = (ref: ComponentMethodsRef) => {
        this.componentRef = ref;
    };

    /**
     * Get the current validation status of the element
     */
    public get isValid(): boolean {
        return false;
    }

    /**
     * Get the element icon URL for the current environment
     */

    public get icon(): string {
        const type = this.props.paymentMethodType || this.type;
        return this.props.icon ?? this.resources.getImage()(type);
    }

    /**
     * Get the element's displayable name
     */
    public get displayName(): string {
        const paymentMethodFromResponse = this.core.paymentMethodsResponse?.paymentMethods?.find(pm => pm.type === this.type);
        return this.props.name || paymentMethodFromResponse?.name || this.type;
    }

    /**
     * Get the element accessible name, used in the aria-label of the button that controls selected payment method
     */
    public get accessibleName(): string {
        return this.displayName;
    }

    /**
     * Used to display the second line of a payment method item
     */
    get additionalInfo(): string {
        return null;
    }

    /**
     * Return the type of an element
     */
    public get type(): string {
        return this.props.type || this.constructor['type'];
    }

    /**
     * Get the payButton component for the current element
     */
    protected payButton = (props: PayButtonFunctionProps) => {
        return <PayButton {...props} amount={this.props.amount} secondaryAmount={this.props.secondaryAmount} onClick={this.submit} />;
    };

    /**
     * Used in the Partial Orders flow.
     * When the Order is updated, the merchant can request new payment methods based on the new remaining amount
     *
     * @private
     */
    protected async handleAdvanceFlowPaymentMethodsUpdate(order: Order | null, amount?: PaymentAmount) {
        return new Promise<PaymentMethodsResponse>((resolve, reject) => {
            if (!this.props.onPaymentMethodsRequest) {
                return reject(new Error('onPaymentMethodsRequest is not implemented'));
            }

            this.props.onPaymentMethodsRequest(
                {
                    ...(order && {
                        order: {
                            orderData: order.orderData,
                            pspReference: order.pspReference
                        }
                    }),
                    locale: this.core.options.locale
                },
                { resolve, reject }
            );
        })
            .catch(error => {
                this.handleError(
                    new AdyenCheckoutError(
                        'IMPLEMENTATION_ERROR',
                        'Something failed during payment methods update or onPaymentMethodsRequest was not implemented',
                        {
                            cause: error
                        }
                    )
                );
            })
            .then(paymentMethodsResponse => {
                // in the case of the session flow we get order, amount, countryCode and shopperLocale from initialize()
                // apply the same logic here for order and amount
                // in the future it might be worth moving this logic to be performed by the core on update()
                // it would make this more consistent
                return this.core.update({
                    ...(paymentMethodsResponse && { paymentMethodsResponse }),
                    order,
                    amount: order ? order.remainingAmount : amount
                });
            });
    }
}

export default UIElement;
