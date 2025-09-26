import { Component, Fragment, h } from 'preact';
import PaymentMethodList from './PaymentMethod/PaymentMethodList';
import Status from './status';
import getOrderStatus from '../../../core/Services/order-status';
import './DropinComponent.scss';
import { sanitizeOrder } from '../../internal/UIElement/utils';
import { PaymentAmount } from '../../../types/global-types';
import { ANALYTICS_RENDERED_STR } from '../../../core/Analytics/constants';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import Button from '../../internal/Button';
import type { DropinComponentProps, DropinComponentState, DropinStatus, DropinStatusProps, onOrderCancelData } from '../types';
import UIElement from '../../internal/UIElement';
import { AnalyticsInfoEvent, InfoEventType } from '../../../core/Analytics/AnalyticsInfoEvent';

export class DropinComponent extends Component<DropinComponentProps, DropinComponentState> {
    public state: DropinComponentState = {
        elements: [],
        fastlanePaymentElement: [],
        instantPaymentElements: [],
        storedPaymentElements: [],
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
        const [storedElementsPromises, elementsPromises, instantPaymentsPromises, fastlanePaymentElementPromise] = this.props.onCreateElements();
        const orderStatusPromise = order ? getOrderStatus({ clientKey, loadingContext }, order) : null;

        void Promise.all([storedElementsPromises, elementsPromises, instantPaymentsPromises, fastlanePaymentElementPromise, orderStatusPromise]).then(
            ([storedPaymentElements, elements, instantPaymentElements, fastlanePaymentElement, orderStatus]) => {
                this.setState({
                    orderStatus,
                    elements,
                    instantPaymentElements,
                    storedPaymentElements,
                    fastlanePaymentElement,
                    showDefaultPaymentMethodList: fastlanePaymentElement.length === 0
                });

                this.setStatus('ready');

                const event = new AnalyticsInfoEvent({
                    type: ANALYTICS_RENDERED_STR,
                    component: 'dropin',
                    configData: this.analyticConfigData
                });

                this.props.modules?.analytics.sendAnalytics(event);
            }
        );

        this.onOrderCancel = this.getOnOrderCancel();
    };

    get analyticConfigData() {
        return {
            openFirstStoredPaymentMethod: this.props.openFirstStoredPaymentMethod,
            showStoredPaymentMethods: this.props.showStoredPaymentMethods
        };
    }

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

        // onSelect event
        if ((activePaymentMethod && activePaymentMethod._id !== paymentMethod._id) || !activePaymentMethod) {
            this.props.onSelect?.(paymentMethod);

            const event = new AnalyticsInfoEvent({
                type: ANALYTICS_RENDERED_STR
            });

            paymentMethod.submitAnalytics(event);
        }
    };

    private handleDisableStoredPaymentMethod = storedPaymentMethod => {
        this.setState({ isDisabling: true });

        new Promise((resolve, reject) => this.props.onDisableStoredPaymentMethod(storedPaymentMethod.props.storedPaymentMethodId, resolve, reject))
            .then(() => {
                this.setState(prevState => ({
                    storedPaymentElements: prevState.storedPaymentElements.filter(pm => pm._id !== storedPaymentMethod._id)
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
            target: 'otherpaymentmethod_button',
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
    private getOnOrderCancel = () => {
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
                this.props.session
                    .cancelOrder(data)
                    .then(() => this.props.core.update({ order: null }))
                    .catch(error => {
                        console.error(error);
                        this.setStatus(error?.message || 'error');
                    });
        }
        return null;
    };

    private onOrderCancel: (data: onOrderCancelData) => void;

    render() {
        const {
            elements,
            fastlanePaymentElement,
            instantPaymentElements,
            storedPaymentElements,
            status,
            activePaymentMethod,
            cachedPaymentMethods,
            showDefaultPaymentMethodList
        } = this.state;

        const isLoading = status.type === 'loading';
        const isRedirecting = status.type === 'redirect';
        const hasPaymentMethodsToBeDisplayed = !!(elements?.length || instantPaymentElements?.length || storedPaymentElements?.length);

        switch (status.type) {
            case 'success':
                return <Status.Success message={this.props?.amount?.value === 0 ? 'resultMessages.preauthorized' : status.props?.message} />;

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
                                    paymentMethods={fastlanePaymentElement}
                                    activePaymentMethod={activePaymentMethod}
                                    cachedPaymentMethods={cachedPaymentMethods}
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
                                paymentMethods={elements}
                                instantPaymentMethods={instantPaymentElements}
                                storedPaymentMethods={storedPaymentElements}
                                activePaymentMethod={activePaymentMethod}
                                cachedPaymentMethods={cachedPaymentMethods}
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
