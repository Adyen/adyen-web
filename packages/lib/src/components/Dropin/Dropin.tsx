import { createRef, h } from 'preact';
import UIElement from '../UIElement';
import defaultProps from './defaultProps';
import DropinComponent from '../../components/Dropin/components/DropinComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import { PaymentAction } from '../../types';
import { DropinElementProps } from './types';
import { getCommonProps } from './components/utils';
import { createElements, createStoredElements } from './elements';

class DropinElement extends UIElement<DropinElementProps> {
    public static type = 'dropin';
    protected static defaultProps = defaultProps;
    public dropinRef = createRef<DropinComponent>();

    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
    }

    get isValid() {
        return !!this.activePaymentMethod?.isValid;
    }

    showValidation() {
        if (this.activePaymentMethod) {
            this.activePaymentMethod.showValidation();
        }

        return this;
    }

    setStatus(status, props = {}) {
        this.dropinRef.current?.setStatus({ type: status, props });
        if (process.env.NODE_ENV === 'test') {
            this['componentFromAction'] = props['component'];
        }
        return this;
    }

    get activePaymentMethod(): UIElement {
        if (!this.dropinRef.current?.state && !this.dropinRef.current?.state.activePaymentMethod) {
            return null;
        }

        return this.dropinRef.current.state.activePaymentMethod;
    }

    get data() {
        if (!this.activePaymentMethod) {
            return null;
        }

        return this.dropinRef.current.state.activePaymentMethod.data;
    }

    /**
     * Calls the onSubmit event with the state of the activePaymentMethod
     */
    submit(): void {
        if (!this.activePaymentMethod) {
            throw new Error('No active payment method.');
        }

        this.activePaymentMethod
            .startPayment()
            .then(this.handleSubmit)
            .catch(error => this.props.onError(error));
    }

    protected handleSubmit = () => {
        const { data, isValid } = this.activePaymentMethod;

        if (!isValid) {
            this.showValidation();
            return false;
        }

        return this.props.onSubmit({ data, isValid }, this);
    };

    /**
     * Creates the Drop-in elements
     */
    private handleCreate = () => {
        const { paymentMethods, storedPaymentMethods, showStoredPaymentMethods, showPaymentMethods, _parentInstance } = this.props;
        const commonProps = getCommonProps({ ...this.props, elementRef: this.elementRef });
        const storedElements = showStoredPaymentMethods ? createStoredElements(storedPaymentMethods, commonProps, _parentInstance?.create) : [];
        const elements = showPaymentMethods ? createElements(paymentMethods, commonProps, _parentInstance?.create) : [];

        return [storedElements, elements];
    };

    handleAction(action: PaymentAction, props = {}) {
        if (!action || !action.type) throw new Error('Invalid Action');

        if (this.activePaymentMethod && this.activePaymentMethod['updateWithAction']) {
            return this.activePaymentMethod['updateWithAction'](action);
        }

        const paymentAction: UIElement = this.props._parentInstance.createFromAction(action, {
            ...props,
            elementRef: this.elementRef, // maintain elementRef for 3DS2 flow
            onAdditionalDetails: state => this.props.onAdditionalDetails(state, this.elementRef),
            isDropin: true
        });

        if (paymentAction) {
            return this.setStatus(paymentAction.props.statusType, { component: paymentAction });
        }

        return null;
    }

    closeActivePaymentMethod() {
        this.dropinRef.current?.closeActivePaymentMethod();
    }

    /**
     * Updates props, resets the internal state and remounts the element.
     * @param props - props to update
     * @returns this - the element instance
     */
    public update(props): this {
        this.props = this.formatProps({ ...this.props, ...props });
        this.dropinRef.current?.update(this.props);

        return this._node ? this.remount() : this;
    }

    private reset = (): this => {
        return this.unmount().remount();
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <DropinComponent
                    {...this.props}
                    onChange={this.setState}
                    onSubmit={this.handleSubmit}
                    onDropinReset={this.reset}
                    elementRef={this.elementRef}
                    onCreateElements={this.handleCreate}
                    ref={this.dropinRef}
                />
            </CoreProvider>
        );
    }
}

export default DropinElement;
