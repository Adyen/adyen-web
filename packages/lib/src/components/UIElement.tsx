import { h } from 'preact';
import BaseElement, { BaseElementProps } from './BaseElement';
import { PaymentAction, PaymentAmount } from '../types';
import getImage from '../utils/get-image';
import PayButton from './internal/PayButton';
import Language from '../language/Language';

export interface UIElementProps extends BaseElementProps {
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element: UIElement) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onError?: (error, element?: UIElement) => void;
    challengeWindowSize?: string;

    name?: string;
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
        this.elementRef = (props && props.elementRef) || this;
    }

    setState(newState: object): void {
        this.state = { ...this.state, ...newState };
        this.onChange();
    }

    onChange(): object {
        const isValid = this.isValid;
        const state = { data: this.data, isValid };
        if (this.props.onChange) this.props.onChange(state, this);
        if (isValid) this.onValid();

        return state;
    }

    onValid() {
        const state = { data: this.data };
        if (this.props.onValid) this.props.onValid(state, this);
        return state;
    }

    startPayment(): Promise<any> {
        return Promise.resolve(true);
    }

    submit(): void {
        const { onError = () => {}, onSubmit = () => {} } = this.props;
        this.startPayment()
            .then(() => {
                const { data, isValid } = this;

                if (!isValid) {
                    this.showValidation();
                    return false;
                }

                return onSubmit({ data, isValid }, this);
            })
            .catch(error => onError(error));
    }

    onComplete(state): void {
        if (this.props.onComplete) this.props.onComplete(state, this);
    }

    showValidation(): this {
        if (this.componentRef && this.componentRef.showValidation) this.componentRef.showValidation();
        return this;
    }

    setStatus(status): this {
        if (this.componentRef && this.componentRef.setStatus) this.componentRef.setStatus(status);
        return this;
    }

    handleAction(action: PaymentAction) {
        if (!action || !action.type) throw new Error('Invalid Action');

        const paymentAction: UIElement = this.props.createFromAction(action, {
            ...this.props,
            // Keep at end since we are creating a new function based on the one in props and don't want this new function overridden
            onAdditionalDetails: state => this.props.onAdditionalDetails(state, this.elementRef)
        });

        if (paymentAction) {
            this.unmount();
            paymentAction.mount(this._node);
            return paymentAction;
        }

        return null;
    }

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
