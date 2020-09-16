import { h } from 'preact';
import UIElement from '../UIElement';
import defaultProps from './defaultProps';
import DropinComponent from '../../components/Dropin/components/DropinComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import { PaymentAction } from '../../types';
import { DropinElementProps } from './types';
import { ERROR_CODES, ERROR_MSG_NO_ACTION } from '../../core/Errors/constants';
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
            .catch(error => this.props.onErrorRef(error));
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
        if (!action || !action.type) this.props.onError({ error: ERROR_CODES[ERROR_MSG_NO_ACTION] }, this);

        if (this.activePaymentMethod.updateWithAction) {
            return this.activePaymentMethod.updateWithAction(action);
        }

        // Extract desired props that we need to pass on from the pmConfiguration for this particular PM
        const pmConfig = getComponentConfiguration(action.paymentMethodType, this.props.paymentMethodsConfiguration);

        const paymentAction: UIElement = this.props.createFromAction(action, {
            isDropin: true,
            onAdditionalDetails: state => this.props.onAdditionalDetails(state, this),
            // Maintain onErrorRef so if the merchant has defined onError in the component options it doesn't get lost as we re-render the component
            onError: this.props.onErrorRef,
            // Overwrite ref if the merchant has defined onError in the pmConfig options
            ...(pmConfig?.onError && { onError: pmConfig.onError })
        });

        if (paymentAction) {
            return this.setStatus(paymentAction.props.statusType, { component: paymentAction });
        }

        return null;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <DropinComponent
                    {...this.props}
                    onChange={this.setState}
                    onSubmit={this.handleSubmit}
                    ref={dropinRef => {
                        this.dropinRef = dropinRef;
                    }}
                />
            </CoreProvider>
        );
    }
}

export default DropinElement;
