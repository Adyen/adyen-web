import { h } from 'preact';
import UIElement from '../UIElement';
import defaultProps from './defaultProps';
import DropinComponent from '../../components/Dropin/components/DropinComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import { PaymentAction } from '../../types';
import { DropinElementProps, InstantPaymentTypes } from './types';
import { getCommonProps } from './components/utils';
import { createElements, createStoredElements } from './elements';
import createInstantPaymentElements from './elements/createInstantPaymentElements';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import { PaymentResponse } from '../types';
import PaymentMethodsResponse from '../../core/ProcessResponse/PaymentMethodsResponse';
import { TxVariants } from '../tx-variants';

const SUPPORTED_INSTANT_PAYMENTS = ['paywithgoogle', 'googlepay', 'applepay'];

function splitPaymentMethods(paymentMethodsResponse: PaymentMethodsResponse, instantPaymentTypes: InstantPaymentTypes[]) {
    const { storedPaymentMethods, paymentMethods } = paymentMethodsResponse;

    return {
        instantPaymentMethods: paymentMethods.filter(({ type }) => instantPaymentTypes.includes(type as InstantPaymentTypes)),
        paymentMethods: paymentMethods.filter(({ type }) => !instantPaymentTypes.includes(type as InstantPaymentTypes)),
        storedPaymentMethods
    };
}

class DropinElement extends UIElement<DropinElementProps> {
    public static type = TxVariants.dropin;

    protected static defaultProps = defaultProps;

    public dropinRef = null;

    /**
     * Reference to the component created from `handleAction` (Ex.: ThreeDS2Challenge)
     */
    public componentFromAction?: UIElement;

    constructor(props: DropinElementProps) {
        super(props);
        this.submit = this.submit.bind(this);
        this.handleAction = this.handleAction.bind(this);
    }

    protected override storeElementRefOnCore() {
        this.core.storeElementReference(this);
    }

    protected override updatePaymentMethodsConfiguration(props) {
        this.core.updatePaymentMethodsConfiguration(props.paymentMethodsConfiguration);
    }

    formatProps(props) {
        return {
            ...super.formatProps(props),
            instantPaymentTypes: Array.from<InstantPaymentTypes>(new Set(props.instantPaymentTypes)).filter(value =>
                SUPPORTED_INSTANT_PAYMENTS.includes(value)
            )
        };
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

    public setStatus(status, props = {}): this {
        this.dropinRef?.setStatus(status, props);
        return this;
    }

    get activePaymentMethod() {
        if (!this.dropinRef?.state && !this.dropinRef?.state.activePaymentMethod) {
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
    public submit(): void {
        if (!this.activePaymentMethod) {
            throw new Error('No active payment method.');
        }

        this.activePaymentMethod.submit();
    }

    /**
     * Creates the Drop-in elements
     */
    private handleCreate = () => {
        const { paymentMethodsConfiguration, showStoredPaymentMethods, showPaymentMethods, instantPaymentTypes } = this.props;

        const { paymentMethods, storedPaymentMethods, instantPaymentMethods } = splitPaymentMethods(
            this.core.paymentMethodsResponse,
            instantPaymentTypes
        );

        const commonProps = getCommonProps({ ...this.props, elementRef: this.elementRef });

        const storedElements = showStoredPaymentMethods
            ? createStoredElements(storedPaymentMethods, paymentMethodsConfiguration, commonProps, this.core)
            : [];
        const elements = showPaymentMethods ? createElements(paymentMethods, paymentMethodsConfiguration, commonProps, this.core) : [];
        const instantPaymentElements = createInstantPaymentElements(instantPaymentMethods, paymentMethodsConfiguration, commonProps, this.core);

        return [storedElements, elements, instantPaymentElements];
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

        if (action.type !== 'redirect' && this.activePaymentMethod?.updateWithAction) {
            return this.activePaymentMethod.updateWithAction(action);
        }

        if (this.elementRef instanceof DropinElement) {
            props = {
                ...this.elementRef.activePaymentMethod?.props,
                ...props
            };
        }

        const paymentAction: UIElement = this.core.createFromAction(action, {
            ...props,
            elementRef: this.elementRef, // maintain elementRef for 3DS2 flow
            onAdditionalDetails: this.handleAdditionalDetails,
            isDropin: true
        });

        if (paymentAction) {
            this.setStatus(paymentAction.props.statusType, { component: paymentAction });
            this.componentFromAction = paymentAction;
            return this;
        }

        return null;
    }

    /**
     * handleOrder is implemented so we don't trigger a callback like in the components
     * @param response - PaymentResponse
     */
    protected handleOrder = ({ order }: PaymentResponse): void => {
        this.updateParent({ order });
    };

    closeActivePaymentMethod() {
        this.dropinRef.closeActivePaymentMethod();
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <DropinComponent
                    {...this.props}
                    onChange={this.setState}
                    elementRef={this.elementRef}
                    onCreateElements={this.handleCreate}
                    ref={dropinRef => {
                        this.dropinRef = dropinRef;
                    }}
                />
            </CoreProvider>
        );
    }
}

export default DropinElement;
