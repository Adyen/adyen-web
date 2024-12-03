import { Component, Fragment, h } from 'preact';
import PaymentMethodList from './PaymentMethod/PaymentMethodList';
import Status from './status';
import getOrderStatus from '../../../core/Services/order-status';
import { DropinComponentProps, DropinComponentState, DropinStatusProps, onOrderCancelData } from '../types';
import './DropinComponent.scss';
import { UIElementStatus } from '../../internal/UIElement/types';
import { sanitizeOrder } from '../../internal/UIElement/utils';
import { PaymentAmount } from '../../../types/global-types';
import { ANALYTICS_RENDERED_STR } from '../../../core/Analytics/constants';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import Button from '../../internal/Button';

export class DropinComponent extends Component<DropinComponentProps, DropinComponentState> {
    public state: DropinComponentState = {
        elements: [],
        fastlanePaymentElement: null,
        instantPaymentElements: [],
        storedPaymentElements: [],
        orderStatus: null,
        isDisabling: false,
        status: { type: 'loading', props: undefined },
        activePaymentMethod: null,
        cachedPaymentMethods: {},
        showPaymentMethodList: true
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
                    fastlanePaymentElement: fastlanePaymentElement[0],
                    showPaymentMethodList: fastlanePaymentElement.length === 0
                });

                this.setStatus('ready');

                this.props.modules?.analytics.sendAnalytics('dropin', {
                    type: ANALYTICS_RENDERED_STR,
                    configData: this.analyticConfigData
                });
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
            this.props.onSelect?.(paymentMethod);

            paymentMethod.submitAnalytics({ type: ANALYTICS_RENDERED_STR });
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

    private onShowPaymentMethodListClick = () => {
        this.setState({
            showPaymentMethodList: true
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

    render(
        props,
        {
            elements,
            // fastlaneElement,
            fastlanePaymentElement,
            instantPaymentElements,
            storedPaymentElements,
            status,
            activePaymentMethod,
            cachedPaymentMethods,
            showPaymentMethodList
        }
    ) {
        const isLoading = status.type === 'loading';
        const isRedirecting = status.type === 'redirect';
        const hasPaymentMethodsToBeDisplayed = elements?.length || instantPaymentElements?.length || storedPaymentElements?.length;

        switch (status.type) {
            case 'success':
                return <Status.Success message={props?.amount?.value === 0 ? 'resultMessages.preauthorized' : status.props?.message} />;

            case 'error':
                return <Status.Error message={status.props?.message} />;

            case 'custom':
                return status.props?.component?.render();

            default:
                return (
                    <div className={`adyen-checkout__dropin adyen-checkout__dropin--${status.type}`}>
                        {isRedirecting && status.props.component && status.props.component.render()}
                        {isLoading && status.props && status.props.component && status.props.component.render()}

                        {/* CLEAN UP THIS */}
                        {!!fastlanePaymentElement && !showPaymentMethodList && (
                            <Fragment>
                                <PaymentMethodList
                                    isLoading={isLoading || isRedirecting}
                                    isDisablingPaymentMethod={this.state.isDisabling}
                                    paymentMethods={[fastlanePaymentElement]}
                                    // instantPaymentMethods={instantPaymentElements}
                                    // storedPaymentMethods={storedPaymentElements}
                                    activePaymentMethod={activePaymentMethod}
                                    cachedPaymentMethods={cachedPaymentMethods}
                                    // order={this.props.order}
                                    // orderStatus={this.state.orderStatus}
                                    // onOrderCancel={this.onOrderCancel}
                                    onSelect={this.handleOnSelectPaymentMethod}
                                    openPaymentMethod={this.props.openPaymentMethod}
                                    openFirstPaymentMethod={this.props.openFirstPaymentMethod}
                                    // openFirstStoredPaymentMethod={this.props.openFirstStoredPaymentMethod}
                                    // onDisableStoredPaymentMethod={this.handleDisableStoredPaymentMethod}
                                    // showRemovePaymentMethodButton={this.props.showRemovePaymentMethodButton}
                                    showRadioButton={this.props.showRadioButton}
                                />
                                <Button variant="primary" label="Other payment methods" onClick={this.onShowPaymentMethodListClick} />
                            </Fragment>
                        )}

                        {!!hasPaymentMethodsToBeDisplayed && showPaymentMethodList && (
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
