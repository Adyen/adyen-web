import { h } from 'preact';
import BaseElement from '../BaseElement/BaseElement';
import PayButton from '../PayButton';
import { getSanitizedResponse } from './utils';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { hasOwnProperty } from '../../../utils/hasOwnProperty';
import { CoreConfiguration, ICore } from '../../../core/types';
import { Resources } from '../../../core/Context/Resources';
import { NewableComponent } from '../../../core/core.registry';
import { ComponentMethodsRef, IUIElement, PayButtonFunctionProps, UIElementProps, UIElementStatus } from './types';
import {
    PaymentAction,
    PaymentResponseData,
    PaymentData,
    RawPaymentResponse,
    PaymentResponseAdvancedFlow,
    OnPaymentFailedData,
    PaymentMethodsResponse,
    Order
} from '../../../types/global-types';
import './UIElement.scss';
import { CheckoutSessionPaymentResponse } from '../../../core/CheckoutSession/types';

export abstract class UIElement<P extends UIElementProps = UIElementProps>
    extends BaseElement<P>
    implements IUIElement
{
    protected componentRef: any;

    protected resources: Resources;

    public elementRef: UIElement;

    public static type = undefined;

    /**
     * Defines all txVariants that the Component supports (in case it support multiple ones besides the 'type' one)
     */
    public static txVariants: string[] = [];

    constructor(props: P) {
        super(props);

        // Only register UIElements that have the 'type' set. Drop-in for example does not have.
        if (this.constructor['type']) {
            this.core.register(this.constructor as NewableComponent);
        }

        this.submit = this.submit.bind(this);
        this.setState = this.setState.bind(this);
        this.onValid = this.onValid.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.makePaymentsCall = this.makePaymentsCall.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.setElementStatus = this.setElementStatus.bind(this);

        this.submitUsingSessionsFlow = this.submitUsingSessionsFlow.bind(this);

        this.elementRef = (props && props.elementRef) || this;
        this.resources = this.props.modules ? this.props.modules.resources : undefined;

        this.storeElementRefOnCore(this.props);
    }

    protected override buildElementProps(componentProps: P) {
        const globalCoreProps = this.core.getCorePropsForComponent();
        const isStoredPaymentMethod = !!componentProps.isStoredPaymentMethod;
        const paymentMethodsResponseProps = isStoredPaymentMethod
            ? {}
            : this.core.paymentMethodsResponse.find(componentProps.type || this.constructor['type']);

        const finalProps = {
            showPayButton: true,
            setStatusAutomatically: true,
            ...globalCoreProps,
            ...paymentMethodsResponseProps,
            ...componentProps
        };

        this.props = this.formatProps({ ...this.constructor['defaultProps'], ...finalProps });
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

    protected onChange(): object {
        const isValid = this.isValid;
        const state = { data: this.data, errors: this.state.errors, valid: this.state.valid, isValid };
        if (this.props.onChange) this.props.onChange(state, this.elementRef);
        if (isValid) this.onValid();

        return state;
    }

    /**
     * Submit payment method data. If the form is not valid, it will trigger validation.
     */
    public submit(): void {
        if (!this.isValid) {
            this.showValidation();
            return;
        }

        this.makePaymentsCall()
            .then(this.sanitizeResponse)
            .then(this.verifyPaymentDidNotFail)
            .then(this.handleResponse)
            .catch(this.handleFailedResult);
    }

    /**
     * Triggers the payment flow
     */
    protected makePaymentsCall(): Promise<PaymentResponseAdvancedFlow | CheckoutSessionPaymentResponse> {
        if (this.props.setStatusAutomatically) {
            this.setElementStatus('loading');
        }

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

        this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Could not submit the payment'));
    }

    private async submitUsingAdvancedFlow(): Promise<PaymentResponseAdvancedFlow> {
        return new Promise<PaymentResponseAdvancedFlow>((resolve, reject) => {
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
        let paymentsResponse: CheckoutSessionPaymentResponse = null;

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            paymentsResponse = await this.core.session.submitPayment(data);
        } catch (error) {
            this.handleError(error);
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

        return paymentsResponse;
    }

    protected sanitizeResponse(rawResponse: RawPaymentResponse): PaymentResponseData {
        return getSanitizedResponse(rawResponse);
    }

    protected verifyPaymentDidNotFail(response: PaymentResponseData): Promise<PaymentResponseData> {
        if (['Cancelled', 'Error', 'Refused'].includes(response.resultCode)) {
            return Promise.reject(response);
        }

        return Promise.resolve(response);
    }

    private onValid() {
        const state = { data: this.data };
        if (this.props.onValid) this.props.onValid(state, this.elementRef);
        return state;
    }

    protected onComplete(state): void {
        if (this.props.onComplete) this.props.onComplete(state, this.elementRef);
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

    /**
     * Submit the payment using sessions flow
     *
     * @param data
     * @private
     */
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

    public handleAction(action: PaymentAction, props = {}): UIElement<P> | null {
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

        const updateCorePromise = this.core.session
            ? this.core.update({ order })
            : this.handleAdvanceFlowPaymentMethodsUpdate(order);

        updateCorePromise.then(() => {
            this.props.onOrderUpdated?.({ order });
        });
    };

    /**
     * Handles when the payment fails. The payment fails when:
     * - adv flow: the merchant rejects the payment
     * - adv flow: the merchant resolves the payment with a failed resultCode
     * - sessions: an error occurs during session when making the payment
     * - sessions: the payment fail
     *
     * @param result
     */
    protected handleFailedResult = (result: OnPaymentFailedData): void => {
        if (this.props.setStatusAutomatically) {
            this.setElementStatus('error');
        }

        this.props.onPaymentFailed?.(result, this.elementRef);
    };

    protected handleSuccessResult = (result: PaymentResponseData): void => {
        const sanitizeResult = (result: PaymentResponseData) => {
            delete result.order;
            delete result.action;
            if (!result.donationToken || result.donationToken.length === 0) delete result.donationToken;
        };

        if (this.props.setStatusAutomatically) {
            this.setElementStatus('success');
        }

        sanitizeResult(result);

        this.props.onPaymentCompleted?.(result, this.elementRef);
    };

    /**
     * Handles a session /payments or /payments/details response.
     * The component will handle automatically actions, orders, and final results.
     *
     * @param rawResponse -
     */
    protected handleResponse(rawResponse: RawPaymentResponse): void {
        const response = getSanitizedResponse(rawResponse);

        if (response.action) {
            this.elementRef.handleAction(response.action);
            return;
        }

        /**
         * TODO: handle order properly on advanced flow.
         */
        if (response.order?.remainingAmount?.value > 0) {
            // we don't want to call elementRef here, use the component handler
            // we do this way so the logic on handlingOrder is associated with payment method
            this.handleOrder(response);
            return;
        }

        this.handleSuccessResult(response);
    }

    /**
     * Call update on parent instance
     * This function exist to make safe access to the protect _parentInstance
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
        return this.props.icon ?? this.resources.getImage()(this.constructor['type']);
    }

    /**
     * Get the element's displayable name
     */
    public get displayName(): string {
        const paymentMethodFromResponse = this.core.paymentMethodsResponse?.paymentMethods?.find(
            pm => pm.type === this.type
        );
        return this.props.name || paymentMethodFromResponse?.name || this.type;
    }

    /**
     * Get the element accessible name, used in the aria-label of the button that controls selected payment method
     */
    public get accessibleName(): string {
        return this.displayName;
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
        return (
            <PayButton
                {...props}
                amount={this.props.amount}
                secondaryAmount={this.props.secondaryAmount}
                onClick={this.submit}
            />
        );
    };

    private async handleAdvanceFlowPaymentMethodsUpdate(order: Order) {
        return new Promise<PaymentMethodsResponse>((resolve, reject) => {
            if (!this.props.onPaymentMethodsRequest) {
                return reject();
            }

            this.props.onPaymentMethodsRequest(
                {
                    order: {
                        orderData: order.orderData,
                        pspReference: order.pspReference
                    },
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
                return this.core.update({
                    ...(paymentMethodsResponse && { paymentMethodsResponse }),
                    order,
                    amount: order.remainingAmount
                });
            });
    }
}

export default UIElement;
