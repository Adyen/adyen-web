import { h } from 'preact';
import BaseElement from './BaseElement';
import { PaymentAction } from '../types';
import getImage from '../utils/get-image';
import PayButton from './internal/PayButton';
import { UIElementProps } from './types';
import { getSanitizedResponse } from './utils';

export class UIElement<P extends UIElementProps = any> extends BaseElement<P> {
    protected componentRef: any;
    public elementRef: any;

    constructor(props: P) {
        super(props);
        this.submit = this.submit.bind(this);
        this.setState = this.setState.bind(this);
        this.onValid = this.onValid.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.elementRef = (props && props.elementRef) || this;
    }

    setState(newState: object): void {
        this.state = { ...this.state, ...newState };
        this.onChange();
    }

    onChange(): object {
        const isValid = this.isValid;
        const state = { data: this.data, errors: this.state.errors, valid: this.state.valid, isValid };
        if (this.props.onChange) this.props.onChange(state, this.elementRef);
        if (isValid) this.onValid();

        return state;
    }

    onValid() {
        const state = { data: this.data };
        if (this.props.onValid) this.props.onValid(state, this.elementRef);
        return state;
    }

    startPayment(): Promise<any> {
        return Promise.resolve(true);
    }

    submit(): void {
        const { onError = () => {}, onSubmit, session } = this.props;
        this.startPayment()
            .then(() => {
                const { data, isValid } = this;

                if (!isValid) {
                    this.showValidation();
                    return false;
                }

                if (onSubmit) return onSubmit({ data, isValid }, this.elementRef);
                if (session) return this.submitPayment(data);

                return onError('Could not submit the payment');
            })
            .catch(error => onError(error));
    }

    onComplete(state): void {
        if (this.props.onComplete) this.props.onComplete(state, this.elementRef);
    }

    showValidation(): this {
        if (this.componentRef && this.componentRef.showValidation) this.componentRef.showValidation();
        return this;
    }

    setStatus(status): this {
        if (this.componentRef && this.componentRef.setStatus) this.componentRef.setStatus(status);
        return this;
    }

    submitPayment(data) {
        this.setStatus('loading');

        return this._parentInstance.session
            .submitPayment(data)
            .then(this.handleResponse)
            .catch(error => {
                this.setStatus('ready');
                this.props.onError(error);
            });
    }

    submitAdditionalDetails(data) {
        return this._parentInstance.session
            .submitDetails(data)
            .then(this.handleResponse)
            .catch(error => {
                this.props.onError(error);
            });
    }

    handleAction(action: PaymentAction, props = {}) {
        if (!action || !action.type) throw new Error('Invalid Action');

        const paymentAction = this.props._parentInstance.createFromAction(action, {
            ...props,
            onAdditionalDetails: state => this.props.onAdditionalDetails(state, this.elementRef)
        });

        if (paymentAction) {
            this.unmount();
            paymentAction.mount(this._node);
            return paymentAction;
        }

        return null;
    }

    handleOrder(order) {
        // TODO handleOrder
        console.log(order);
    }

    handleResponse(rawResponse): void {
        const response = getSanitizedResponse(rawResponse);

        if (response.sessionData) this._parentInstance.session.updateSessionData(response.sessionData);

        if (response.action) {
            this.handleAction(response.action);
        } else if (response?.order?.remainingAmount?.value > 0) {
            this.handleOrder(response.order);
        } else {
            this.handleFinalResult(response);
        }
    }

    protected handleFinalResult = result => {
        if (this.props.onPaymentCompleted) this.props.onPaymentCompleted(result, this);
        return result;
    };

    get isValid(): boolean {
        return false;
    }

    /**
     * Get the element icon URL for the current environment
     */
    get icon(): string {
        return getImage({ loadingContext: this.props.loadingContext })(this.constructor['type']);
    }

    /**
     * Get the element displayable name
     */
    get displayName(): string {
        return this.props.name || this.constructor['type'];
    }

    public payButton = props => {
        return <PayButton {...props} amount={this.props.amount} onClick={this.submit} />;
    };
}

export default UIElement;
