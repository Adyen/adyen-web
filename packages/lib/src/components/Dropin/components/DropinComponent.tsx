import { Component, Fragment, h } from 'preact';
import PaymentMethodList from './PaymentMethod/PaymentMethodList';
import Status from './status';
import getOrderStatus from '../../../core/Services/order-status';
import './DropinComponent.scss';
import { sanitizeOrder } from '../../internal/UIElement/utils';
import type { PaymentAmount } from '../../../types/global-types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import Button from '../../internal/Button';
import type {
    DropinComponentProps,
    DropinComponentState,
    DropinStatus,
    DropinStatusProps,
    onOrderCancelData,
    onOrderCancelInternalCallback,
    PaymentMethodDisplayMode
} from '../types';
import { getReadyPaymentMethods, getUnavailablePaymentMethods } from '../utils/readyEventPaymentMethods';
import UIElement from '../../internal/UIElement';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../../core/Analytics/events/AnalyticsInfoEvent';
import { DropinSuccessState } from './DropinSuccessState';

export class DropinComponent extends Component<DropinComponentProps, DropinComponentState> {
    public state: DropinComponentState = {
        paymentMethodElements: [],
        fastlanePaymentMethodElement: [],
        instantPaymentMethodElements: [],
        storedPaymentMethodElements: [],
        orderStatus: null,
        isDisabling: false,
        status: { type: 'loading', props: undefined },
        activePaymentMethod: null,
        cachedPaymentMethods: {},
        showDefaultPaymentMethodList: true
    };

    componentDidMount() {
        this.prepareDropinData();
    }

    public prepareDropinData = () => {
        const { order, clientKey, loadingContext } = this.props;
        const {
            storedPaymentMethodElements,
            paymentMethodElements,
            instantPaymentMethodElements,
            fastlanePaymentMethodElement,
            paymentMethodDisplayModes
        } = this.props.onBuildPaymentMethods();
        const orderStatusPromise = order ? getOrderStatus({ clientKey, loadingContext }, order) : null;

        void Promise.all([
            storedPaymentMethodElements,
            paymentMethodElements,
            instantPaymentMethodElements,
            fastlanePaymentMethodElement,
            orderStatusPromise
        ])
            .then(([storedElements, elements, instantElements, fastlaneElements, orderStatus]) => {
                const elementsByDisplayMode: Record<PaymentMethodDisplayMode, UIElement[]> = {
                    fastlane: fastlaneElements,
                    instant: instantElements,
                    stored: storedElements,
                    regular: elements
                };

                const paymentMethods = getReadyPaymentMethods(
                    paymentMethodDisplayModes.map(e => e.displayMode),
                    elementsByDisplayMode,
                    this.props.core
                );
                const unavailablePaymentMethods = getUnavailablePaymentMethods(paymentMethodDisplayModes, elementsByDisplayMode);
                this.setState({
                    orderStatus,
                    paymentMethodElements: elements,
                    instantPaymentMethodElements: instantElements,
                    storedPaymentMethodElements: storedElements,
                    fastlanePaymentMethodElement: fastlaneElements,
                    showDefaultPaymentMethodList: fastlaneElements.length === 0
                });
                this.setStatus('ready');

                this.props.onElementsCreated([...instantElements, ...storedElements, ...elements, ...fastlaneElements]);

                const dropinReadyEvent = new AnalyticsInfoEvent({
                    type: InfoEventType.Ready,
                    component: 'dropin',
                    paymentMethods,
                    unavailablePaymentMethods
                });
                this.props.core.modules.analytics.sendAnalytics(dropinReadyEvent);
            })
            .catch(() => {
                this.setStatus('error');
            });

        this.onOrderCancel = this.getOnOrderCancel();
    };

    public setStatus = (status: DropinStatus['type'], props: DropinStatusProps = {}) => {
        this.setState({ status: { type: status, props } });
    };

    private setActivePaymentMethod = (paymentMethod: UIElement): void => {
        if (paymentMethod === this.state.activePaymentMethod) {
            return;
        }

        this.setState(prevState => ({
            activePaymentMethod: paymentMethod,
            cachedPaymentMethods: { ...prevState.cachedPaymentMethods, [paymentMethod._id]: true }
        }));

        if (this.state.cachedPaymentMethods[paymentMethod._id]) {
            paymentMethod.activate();
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.status.type !== this.state.status.type && this.state.activePaymentMethod) {
            // @ts-ignore TODO: Drop-in has its own 'status' values ('custom' for ex) which differs from regular UIElementStatus. Need to investigate best way to define/use this status variable
            this.state.activePaymentMethod.setStatus(this.state.status.type);
        }

        if (this.state.status.type === 'ready' && prevState.status.type !== 'ready' && this.props.onReady) {
            this.props.onReady();
        }
    }

    private handleOnSelectPaymentMethod = paymentMethod => {
        const { activePaymentMethod } = this.state;

        this.setActivePaymentMethod(paymentMethod);

        if ((activePaymentMethod && activePaymentMethod._id !== paymentMethod._id) || !activePaymentMethod) {
            this.props.onSelect?.(paymentMethod);
        }
    };

    private handleDisableStoredPaymentMethod = storedPaymentMethod => {
        this.setState({ isDisabling: true });

        new Promise((resolve, reject) => this.props.onDisableStoredPaymentMethod(storedPaymentMethod.props.storedPaymentMethodId, resolve, reject))
            .then(() => {
                this.setState(prevState => ({
                    storedPaymentMethodElements: prevState.storedPaymentMethodElements.filter(pm => pm._id !== storedPaymentMethod._id)
                }));
                this.setState({ isDisabling: false });
            })
            .catch(() => {
                this.setState({ isDisabling: false });
            });
    };

    private readonly onShowDefaultPaymentMethodListClick = () => {
        this.setState({
            showDefaultPaymentMethodList: true
        });

        const event = new AnalyticsInfoEvent({
            type: InfoEventType.clicked,
            target: UiTarget.otherPaymentMethodButton,
            component: 'dropin'
        });

        this.props.modules?.analytics.sendAnalytics(event);
    };

    closeActivePaymentMethod() {
        this.setState({ activePaymentMethod: null });
    }

    /**
     * getOnOrderCancel decides which onOrderCancel logic should be used, manual or sessions
     */
    private readonly getOnOrderCancel = (): ((data: onOrderCancelData) => void) | null => {
        if (this.props.onOrderCancel) {
            return (data: onOrderCancelData) => {
                const order = sanitizeOrder(data.order);
                new Promise<{ amount: PaymentAmount }>((resolve, reject) => {
                    this.props.onOrderCancel({ order }, { resolve, reject });
                })
                    .then(({ amount }) => this.props.elementRef.handleAdvanceFlowPaymentMethodsUpdate(null, amount))
                    .catch(error => {
                        throw new AdyenCheckoutError('NETWORK_ERROR', error);
                    });
            };
        }
        if (this.props.session) {
            return (data: onOrderCancelData) =>
                void this.props.session
                    .cancelOrder(data)
                    .then(() => this.props.core.update({ order: null }))
                    .catch(error => {
                        console.error(error);
                        this.setStatus(error?.message || 'error');
                    });
        }
        return null;
    };

    private onOrderCancel: onOrderCancelInternalCallback;

    render() {
        const {
            paymentMethodElements,
            fastlanePaymentMethodElement,
            instantPaymentMethodElements,
            storedPaymentMethodElements,
            status,
            activePaymentMethod,
            showDefaultPaymentMethodList
        } = this.state;

        const isLoading = status.type === 'loading';
        const isRedirecting = status.type === 'redirect';
        const hasPaymentMethodsToBeDisplayed = !!(
            paymentMethodElements?.length ||
            instantPaymentMethodElements?.length ||
            storedPaymentMethodElements?.length
        );

        switch (status.type) {
            case 'success':
                return <DropinSuccessState message={status.props?.message} />;

            case 'error':
                return <Status.Error message={status.props?.message} />;

            case 'custom':
                return status.props?.component?.render();

            default:
                return (
                    <div className={`adyen-checkout__dropin adyen-checkout__dropin--${status.type}`}>
                        {isRedirecting && status.props.component && status.props.component.render()}
                        {isLoading && status.props && status.props.component && status.props.component.render()}

                        {!showDefaultPaymentMethodList && (
                            <Fragment>
                                <PaymentMethodList
                                    isLoading={isLoading}
                                    paymentMethods={fastlanePaymentMethodElement}
                                    activePaymentMethod={activePaymentMethod}
                                    onSelect={this.handleOnSelectPaymentMethod}
                                    openFirstPaymentMethod
                                    showRadioButton={this.props.showRadioButton}
                                />

                                {hasPaymentMethodsToBeDisplayed && (
                                    <Button
                                        classNameModifiers={['dropin-show-paymentmethods']}
                                        variant="link"
                                        inline
                                        label="Other payment methods"
                                        onClick={this.onShowDefaultPaymentMethodListClick}
                                    />
                                )}
                            </Fragment>
                        )}

                        {hasPaymentMethodsToBeDisplayed && showDefaultPaymentMethodList && (
                            <PaymentMethodList
                                isLoading={isLoading || isRedirecting}
                                isDisablingPaymentMethod={this.state.isDisabling}
                                paymentMethods={paymentMethodElements}
                                instantPaymentMethods={instantPaymentMethodElements}
                                storedPaymentMethods={storedPaymentMethodElements}
                                activePaymentMethod={activePaymentMethod}
                                order={this.props.order}
                                orderStatus={this.state.orderStatus}
                                onOrderCancel={this.onOrderCancel}
                                onSelect={this.handleOnSelectPaymentMethod}
                                openPaymentMethod={this.props.openPaymentMethod}
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
}

export default DropinComponent;
