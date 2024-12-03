import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import defaultProps from './defaultProps';
import DropinComponent from '../../components/Dropin/components/DropinComponent';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { getCommonProps } from './components/utils';
import { createElements, createStoredElements } from './elements';
import createInstantPaymentElements from './elements/createInstantPaymentElements';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import splitPaymentMethods from './elements/splitPaymentMethods';
import { TxVariants } from '../tx-variants';

import type { DropinConfiguration, InstantPaymentTypes, PaymentMethodsConfiguration } from './types';
import type { PaymentAction, PaymentResponseData } from '../../types/global-types';
import type { ICore } from '../../core/types';
import type { IDropin } from './types';

const SUPPORTED_INSTANT_PAYMENTS = ['paywithgoogle', 'googlepay', 'applepay'];

class DropinElement extends UIElement<DropinConfiguration> implements IDropin {
    public static type = TxVariants.dropin;

    protected static defaultProps = defaultProps;

    public dropinRef = null;

    private paymentMethodsConfiguration: PaymentMethodsConfiguration;
    /**
     * Reference to the component created from `handleAction` (Ex.: ThreeDS2Challenge)
     */
    public componentFromAction?: UIElement;

    constructor(checkout: ICore, props?: DropinConfiguration) {
        super(checkout, props);
        this.submit = this.submit.bind(this);
        this.handleAction = this.handleAction.bind(this);

        this.props.paymentMethodComponents.forEach(PaymentMethod => this.core.register(PaymentMethod));
        this.paymentMethodsConfiguration = this.props.paymentMethodsConfiguration || {};
    }

    protected override storeElementRefOnCore() {
        this.core.storeElementReference(this);
    }

    formatProps(props) {
        return {
            type: 'dropin', // for analytics
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

    public displayFinalAnimation(type: 'success' | 'error') {
        if (this.props.disableFinalAnimation) return;

        this.dropinRef.setStatus(type);
    }

    /**
     * Calls the onSubmit event with the state of the activePaymentMethod
     */
    public override submit(): void {
        if (!this.activePaymentMethod) {
            throw new Error('No active payment method.');
        }

        if (!this.activePaymentMethod.isValid) {
            this.activePaymentMethod.showValidation();
        }

        if (this.activePaymentMethod.isInstantPayment) {
            this.closeActivePaymentMethod();
        }

        this.activePaymentMethod.submit();
    }

    /**
     * Creates the Drop-in elements
     */
    private handleCreate = () => {
        const { paymentMethodsConfiguration, showStoredPaymentMethods, showPaymentMethods, instantPaymentTypes } = this.props;

        const { paymentMethods, storedPaymentMethods, instantPaymentMethods, fastlanePaymentMethod } = splitPaymentMethods(
            this.core.paymentMethodsResponse,
            instantPaymentTypes
        );

        const commonProps = getCommonProps({ ...this.props, elementRef: this.elementRef });

        const elements = showPaymentMethods ? createElements(paymentMethods, paymentMethodsConfiguration, commonProps, this.core) : [];
        const instantPaymentElements = createInstantPaymentElements(instantPaymentMethods, paymentMethodsConfiguration, commonProps, this.core);
        const storedElements = showStoredPaymentMethods
            ? createStoredElements(storedPaymentMethods, paymentMethodsConfiguration, commonProps, this.core)
            : [];
        const fastlanePaymentElement = fastlanePaymentMethod
            ? createElements([fastlanePaymentMethod], paymentMethodsConfiguration, commonProps, this.core)
            : [];

        return [storedElements, elements, instantPaymentElements, fastlanePaymentElement];
    };

    public handleAction(action: PaymentAction, props = {}): this | null {
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
    protected handleOrder = ({ order }: PaymentResponseData): void => {
        void this.updateParent({ order });
    };

    closeActivePaymentMethod() {
        this.dropinRef.closeActivePaymentMethod();
    }

    protected handleKeyPress(e: h.JSX.TargetedKeyboardEvent<HTMLInputElement> | KeyboardEvent) {
        if (e.key === 'Enter' || e.code === 'Enter') {
            // If the active element has role="radio", we're on a header in the PMList, in which case we don't want to validate the form, or, prevent the default behaviour
            const isPMHeader = document?.activeElement?.getAttribute('role') === 'radio';
            if (isPMHeader) {
                return;
            }
            super.handleKeyPress(e);
        }
    }

    protected onEnterKeyPressed(activeElement: Element, component: UIElement) {
        // We want to have a ref to the activePM, if we can; not a ref to the Dropin
        const pmComponent = this.activePaymentMethod ?? component;
        this.activePaymentMethod?.onEnterKeyPressed(activeElement, pmComponent);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>
                    <DropinComponent
                        {...this.props}
                        core={this.core}
                        elementRef={this.elementRef}
                        onCreateElements={this.handleCreate}
                        ref={dropinRef => {
                            this.dropinRef = dropinRef;
                        }}
                    />
                </SRPanelProvider>
            </CoreProvider>
        );
    }
}

export default DropinElement;
