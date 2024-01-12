import { Component, h } from 'preact';
import PaymentMethodList from './PaymentMethod/PaymentMethodList';
import Status from './status';
import getOrderStatus from '../../../core/Services/order-status';
import { DropinComponentProps, DropinComponentState, DropinStatusProps, onOrderCancelData } from '../types';
import './DropinComponent.scss';
import { UIElementStatus } from '../../types';
import { ANALYTICS_RENDERED_STR } from '../../../core/Analytics/constants';

export class DropinComponent extends Component<DropinComponentProps, DropinComponentState> {
    public state: DropinComponentState = {
        elements: [],
        instantPaymentElements: [],
        orderStatus: null,
        isDisabling: false,
        status: { type: 'loading', props: undefined },
        activePaymentMethod: null,
        cachedPaymentMethods: {}
    };

    componentDidMount() {
        this.prepareDropinData();
    }

    public prepareDropinData = () => {
        const { order, clientKey, loadingContext } = this.props;
        const [storedElementsPromises, elementsPromises, instantPaymentsPromises] = this.props.onCreateElements();
        const orderStatusPromise = order ? getOrderStatus({ clientKey, loadingContext }, order) : null;

        Promise.all([storedElementsPromises, elementsPromises, instantPaymentsPromises, orderStatusPromise]).then(
            ([storedElements, elements, instantPaymentElements, orderStatus]) => {
                this.setState({ instantPaymentElements, elements: [...storedElements, ...elements], orderStatus });
                this.setStatus('ready');

                const data = {
                    component: 'dropin',
                    type: ANALYTICS_RENDERED_STR
                    // paymentMethods: elements.map(e => e.props.type), // TODO might be added (used to be in original analytics, in the setup call)
                };

                // AnalyticsAction: action: 'event' type:'rendered'
                this.props.modules?.analytics.createAnalyticsEvent({
                    event: 'info',
                    data
                });
            }
        );

        this.onOrderCancel = this.getOnOrderCancel();
    };

    public setStatus = (status: UIElementStatus, props: DropinStatusProps = {}) => {
        this.setState({ status: { type: status, props } });
    };

    private setActivePaymentMethod = paymentMethod => {
        this.setState(prevState => ({
            activePaymentMethod: paymentMethod,
            cachedPaymentMethods: { ...prevState.cachedPaymentMethods, [paymentMethod._id]: true }
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
        if ((activePaymentMethod && activePaymentMethod._id !== paymentMethod._id) || !activePaymentMethod) {
            this.props.onSelect(paymentMethod);

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
                    .then(() => this.props._parentInstance.update({ order: null }))
                    .catch(error => this.setStatus(error?.message || 'error'));
        }
        return null;
    };

    private onOrderCancel: (data: onOrderCancelData) => void;

    render(props, { elements, instantPaymentElements, status, activePaymentMethod, cachedPaymentMethods }) {
        const isLoading = status.type === 'loading';
        const isRedirecting = status.type === 'redirect';

        switch (status.type) {
            case 'success':
                return <Status.Success message={status.props?.message} />;

            case 'error':
                return <Status.Error message={status.props?.message} />;

            case 'custom':
                return status.props?.component?.render();

            default:
                return (
                    <div className={`adyen-checkout__dropin adyen-checkout__dropin--${status.type}`}>
                        {isRedirecting && status.props.component && status.props.component.render()}
                        {isLoading && status.props && status.props.component && status.props.component.render()}
                        {elements && !!elements.length && (
                            <PaymentMethodList
                                isLoading={isLoading || isRedirecting}
                                isDisablingPaymentMethod={this.state.isDisabling}
                                paymentMethods={elements}
                                instantPaymentMethods={instantPaymentElements}
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
                            />
                        )}
                    </div>
                );
        }
    }
}

export default DropinComponent;
