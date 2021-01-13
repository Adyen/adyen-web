import { Component, h } from 'preact';
import PaymentMethodList from './PaymentMethod/PaymentMethodList';
import { createElements, createStoredElements } from '../elements';
import { getCommonProps } from './utils';
import Status from './status';
import getProp from '../../../utils/getProp';
import UIElement from '../../UIElement';
import { DropinComponentProps } from '../types';
import './DropinComponent.scss';
import getOrderStatus from '../../../core/Services/order-status';
import { OrderStatus } from '../../../types';

interface DropinStatus {
    type: 'loading' | 'ready' | 'success' | 'error';
}

interface DropinComponentState {
    elements: any[];
    status: DropinStatus;
    activePaymentMethod: UIElement;
    cachedPaymentMethods: object;
    isDisabling: boolean;
    orderStatus: OrderStatus;
}

export class DropinComponent extends Component<DropinComponentProps, DropinComponentState> {
    public state: DropinComponentState = {
        elements: [],
        orderStatus: null,
        isDisabling: false,
        status: { type: 'loading' },
        activePaymentMethod: null,
        cachedPaymentMethods: {}
    };

    componentDidMount() {
        this.prepareDropinData();
    }

    public prepareDropinData = () => {
        const { paymentMethodsConfiguration, paymentMethods, storedPaymentMethods, order, clientKey, loadingContext } = this.props;
        const commonProps = getCommonProps(this.props);

        const storedElementsPromises = this.props.showStoredPaymentMethods
            ? createStoredElements(storedPaymentMethods, commonProps, paymentMethodsConfiguration)
            : [];
        const elementsPromises = this.props.showPaymentMethods ? createElements(paymentMethods, commonProps, paymentMethodsConfiguration) : [];
        const orderStatusPromise = order ? getOrderStatus({ clientKey, loadingContext }, order) : null;

        Promise.all([storedElementsPromises, elementsPromises, orderStatusPromise]).then(([storedElements, elements, orderStatus]) => {
            this.setState({ elements: [...storedElements, ...elements], orderStatus });
            this.setStatus({ type: 'ready' });

            if (this.props.modules.analytics) {
                this.props.modules.analytics.send({
                    containerWidth: this.base && (this.base as HTMLElement).offsetWidth,
                    paymentMethods: elements.map(e => e.props.type),
                    component: 'dropin',
                    flavor: 'dropin'
                });
            }
        });
    };

    private setStatus = status => {
        this.setState({ status });
    };

    private setActivePaymentMethod = paymentMethod => {
        this.setState(prevState => ({
            activePaymentMethod: paymentMethod,
            cachedPaymentMethods: { ...prevState.cachedPaymentMethods, [paymentMethod.props.id]: true }
        }));
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.status.type !== this.state.status.type && this.state.activePaymentMethod) {
            this.state.activePaymentMethod.setStatus(this.state.status.type);
        }

        if (this.state.status.type === 'ready' && prevState.status.type !== 'ready' && this.props.onReady) {
            this.props.onReady();
        }
    }

    private handleOnSelectPaymentMethod = paymentMethod => {
        const { activePaymentMethod } = this.state;

        this.setActivePaymentMethod(paymentMethod);

        // onSelect event
        if ((activePaymentMethod && activePaymentMethod.props.id !== paymentMethod.props.id) || !activePaymentMethod) {
            this.props.onSelect(paymentMethod);
        }
    };

    private handleDisableStoredPaymentMethod = storedPaymentMethod => {
        this.setState({ isDisabling: true });

        new Promise((resolve, reject) => this.props.onDisableStoredPaymentMethod(storedPaymentMethod.props.storedPaymentMethodId, resolve, reject))
            .then(() => {
                this.setState(prevState => ({ elements: prevState.elements.filter(pm => pm.props.id !== storedPaymentMethod.props.id) }));
                this.setState({ isDisabling: false });
            })
            .catch(() => {
                this.setState({ isDisabling: false });
            });
    };

    closeActivePaymentMethod() {
        this.setState({ activePaymentMethod: null });
    }

    render(props, { elements, status, activePaymentMethod, cachedPaymentMethods }) {
        const isLoading = status.type === 'loading';
        const isRedirecting = status.type === 'redirect';

        switch (status.type) {
            case 'success':
                return <Status.Success message={getProp(status, 'props.message') || null} />;

            case 'error':
                return <Status.Error message={getProp(status, 'props.message') || null} />;

            case 'custom':
                return status.props.component.render();

            default:
                return (
                    <div className={`adyen-checkout__dropin adyen-checkout__dropin--${status.type}`}>
                        {isRedirecting && status.props.component && status.props.component.render()}
                        {isLoading && status.props && status.props.component && status.props.component.render()}
                        {elements && !!elements.length && (
                            <PaymentMethodList
                                isLoading={isLoading || isRedirecting}
                                isDisabling={this.state.isDisabling}
                                paymentMethods={elements}
                                activePaymentMethod={activePaymentMethod}
                                cachedPaymentMethods={cachedPaymentMethods}
                                order={this.props.order}
                                orderStatus={this.state.orderStatus}
                                onOrderCancel={this.props.onOrderCancel}
                                onSelect={this.handleOnSelectPaymentMethod}
                                openFirstPaymentMethod={this.props.openFirstPaymentMethod}
                                openFirstStoredPaymentMethod={this.props.openFirstStoredPaymentMethod}
                                onDisableStoredPaymentMethod={this.handleDisableStoredPaymentMethod}
                                showRemovePaymentMethodButton={this.props.showRemovePaymentMethodButton}
                            />
                        )}
                    </div>
                );
        }
    }
}

export default DropinComponent;
