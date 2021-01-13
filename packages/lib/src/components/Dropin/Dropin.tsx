import { h } from 'preact';
import UIElement from '../UIElement';
import defaultProps from './defaultProps';
import DropinComponent from '../../components/Dropin/components/DropinComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import { PaymentAction } from '../../types';
import { DropinElementProps } from './types';
import { getComponentConfiguration } from '../index';

class DropinElement extends UIElement<DropinElementProps> {
    public static type = 'dropin';
    protected static defaultProps = defaultProps;
    public dropinRef = null;

    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
    }

    get isValid() {
        return !!this.dropinRef && !!this.dropinRef.state.activePaymentMethod && !!this.dropinRef.state.activePaymentMethod.isValid;
    }

    showValidation() {
        if (this.dropinRef.state.activePaymentMethod) {
            this.dropinRef.state.activePaymentMethod.showValidation();
        }

        return this;
    }

    setStatus(status, props = {}) {
        this.dropinRef.setStatus({ type: status, props });
        if (process.env.NODE_ENV === 'test') {
            this['componentFromAction'] = props['component'];
        }
        return this;
    }

    get activePaymentMethod() {
        if (!this.dropinRef.state && !this.dropinRef.state.activePaymentMethod) {
            return null;
        }

        return this.dropinRef.state.activePaymentMethod;
    }

    get data() {
        if (!this.activePaymentMethod) {
            return null;
        }

        return this.dropinRef.state.activePaymentMethod.data;
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

    handleAction(action: PaymentAction) {
        if (!action || !action.type) throw new Error('Invalid Action');

        if (this.activePaymentMethod?.updateWithAction) {
            return this.activePaymentMethod.updateWithAction(action);
        }

        const pmType = action.paymentMethodType || 'scheme';

        // Extract desired props that we need to pass on from the pmConfiguration for this particular PM
        const pmConfig = getComponentConfiguration(pmType, this.props.paymentMethodsConfiguration);

        const paymentAction: UIElement = this.props.createFromAction(action, {
            isDropin: true,
            elementRef: this.elementRef,
            ...this.props,
            ...pmConfig,
            // Keep at end since we are creating a new function based on the one in props and don't want this new function overridden
            onAdditionalDetails: state => this.props.onAdditionalDetails(state, this)
        });

        if (paymentAction) {
            return this.setStatus(paymentAction.props.statusType, { component: paymentAction });
        }

        return null;
    }

    closeActivePaymentMethod() {
        this.dropinRef.closeActivePaymentMethod();
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <DropinComponent
                    {...this.props}
                    onChange={this.setState}
                    onSubmit={this.handleSubmit}
                    elementRef={this.elementRef}
                    ref={dropinRef => {
                        this.dropinRef = dropinRef;
                    }}
                />
            </CoreProvider>
        );
    }
}

export default DropinElement;
