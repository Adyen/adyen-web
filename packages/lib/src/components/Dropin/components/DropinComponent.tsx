import { Component, h } from 'preact';
import PaymentMethodList from './PaymentMethod/PaymentMethodList';
import Status from './status';
import getOrderStatus from '../../../core/Services/order-status';
import { DropinComponentProps, DropinComponentState, onOrderCancelData } from '../types';
import { ANALYTICS_RENDERED_STR } from '../../../core/Analytics/constants';
import './DropinComponent.scss';
import UIElement from '../../internal/UIElement';
import type { UIElementStatus } from '../../internal/UIElement/types';

export class DropinComponent extends Component<DropinComponentProps, DropinComponentState> {
    public state: DropinComponentState = {
        elements: [],
        instantPaymentElements: [],
        storedPaymentElements: [],
        orderStatus: null,
        isDisabling: false,
        status: 'loading',
        activePaymentMethod: null,
        cachedPaymentMethods: {},
        actionComponent: null
    };

    componentDidMount() {
        this.prepareDropinData();
    }

    public prepareDropinData = () => {
        const { order, clientKey, loadingContext } = this.props;
        const [storedElementsPromises, elementsPromises, instantPaymentsPromises] = this.props.onCreateElements();
        const orderStatusPromise = order ? getOrderStatus({ clientKey, loadingContext }, order) : null;

        Promise.all([storedElementsPromises, elementsPromises, instantPaymentsPromises, orderStatusPromise]).then(
            ([storedPaymentElements, elements, instantPaymentElements, orderStatus]) => {
                this.setState({ instantPaymentElements, elements, storedPaymentElements, orderStatus, status: 'ready' });

                this.props.modules?.analytics.sendAnalytics('dropin', { type: ANALYTICS_RENDERED_STR });
            }
        );

        this.onOrderCancel = this.getOnOrderCancel();
    };

    public setStatus(status: UIElementStatus) {
        this.setState({ status });
    }

    public setActionComponent(component: UIElement) {
        const isRedirect = component.props.actionType === 'redirect';
        this.setState({ actionComponent: component, ...(isRedirect && { status: 'redirect' }) });
    }

    private setActivePaymentMethod = paymentMethod => {
        this.setState(prevState => ({
            activePaymentMethod: paymentMethod,
            cachedPaymentMethods: { ...prevState.cachedPaymentMethods, [paymentMethod._id]: true }
        }));
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.status !== this.state.status && this.state.activePaymentMethod) {
            this.state.activePaymentMethod.componentRef.setStatus(this.state.status);
        }

        if (this.state.status === 'ready' && prevState.status !== 'ready' && this.props.onReady) {
            this.props.onReady();
        }
    }

    private handleOnSelectPaymentMethod = paymentMethod => {
        const { activePaymentMethod } = this.state;

        this.setActivePaymentMethod(paymentMethod);

        // onSelect event
        if ((activePaymentMethod && activePaymentMethod._id !== paymentMethod._id) || !activePaymentMethod) {
            this.props.onSelect?.(paymentMethod);

            paymentMethod.submitAnalytics({ type: ANALYTICS_RENDERED_STR });
        }
    };

    private handleDisableStoredPaymentMethod = storedPaymentMethod => {
        this.setState({ isDisabling: true });

        new Promise((resolve, reject) => this.props.onDisableStoredPaymentMethod(storedPaymentMethod.props.storedPaymentMethodId, resolve, reject))
            .then(() => {
                this.setState(prevState => ({ elements: prevState.elements.filter(pm => pm._id !== storedPaymentMethod._id) }));
                this.setState({ isDisabling: false });
            })
            .catch(() => {
                this.setState({ isDisabling: false });
            });
    };

    closeActivePaymentMethod() {
        this.setState({ activePaymentMethod: null });
    }

    /**
     * getOnOrderCancel decides which onOrderCancel logic should be used, manual or sessions
     */
    private getOnOrderCancel = () => {
        if (this.props.onOrderCancel) {
            return (data: onOrderCancelData) => {
                this.props.onOrderCancel(data);
            };
        }
        if (this.props.session) {
            return (data: onOrderCancelData) =>
                this.props.session
                    .cancelOrder(data)
                    .then(() => this.props.core.update({ order: null }))
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .catch(error => this.setState({ status: 'error' }));
        }
        return null;
    };

    private onOrderCancel: (data: onOrderCancelData) => void;

    render(props, { elements, instantPaymentElements, storedPaymentElements, status, activePaymentMethod, cachedPaymentMethods, actionComponent }) {
        if (status === 'success') {
            return <Status.Success message={props?.amount?.value === 0 ? 'resultMessages.preauthorized' : status.props?.message} />;
        }

        if (status === 'error') {
            return <Status.Error message={status.props?.message} />;
        }

        if (actionComponent?.props.actionType === 'custom') {
            return actionComponent.render();
        }

        const isLoading = status === 'redirect' || status === 'loading';
        const hasPaymentMethodsToBeDisplayed = elements?.length || instantPaymentElements?.length || storedPaymentElements?.length;

        return (
            <div className={`adyen-checkout__dropin adyen-checkout__dropin--${status.type}`}>
                {['redirect', 'fingerprint'].includes(actionComponent?.props.actionType) && actionComponent.render()}

                {hasPaymentMethodsToBeDisplayed && (
                    <PaymentMethodList
                        isLoading={isLoading}
                        isDisablingPaymentMethod={this.state.isDisabling}
                        paymentMethods={elements}
                        instantPaymentMethods={instantPaymentElements}
                        storedPaymentMethods={storedPaymentElements}
                        activePaymentMethod={activePaymentMethod}
                        cachedPaymentMethods={cachedPaymentMethods}
                        order={this.props.order}
                        orderStatus={this.state.orderStatus}
                        onOrderCancel={this.onOrderCancel}
                        onSelect={this.handleOnSelectPaymentMethod}
                        openFirstPaymentMethod={this.props.openFirstPaymentMethod}
                        openFirstStoredPaymentMethod={this.props.openFirstStoredPaymentMethod}
                        onDisableStoredPaymentMethod={this.handleDisableStoredPaymentMethod}
                        showRemovePaymentMethodButton={this.props.showRemovePaymentMethodButton}
                        showRadioButton={this.props.showRadioButton}
                    />
                )}
            </div>
        );
    }
}

export default DropinComponent;
