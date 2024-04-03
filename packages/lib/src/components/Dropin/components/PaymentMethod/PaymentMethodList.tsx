import { Component, Fragment, h } from 'preact';
import classNames from 'classnames';
import PaymentMethodItem from './PaymentMethodItem';
import getProp from '../../../../utils/getProp';
import styles from '../DropinComponent.module.scss';
import UIElement from '../../../UIElement';
import { Order, OrderStatus } from '../../../../types';
import OrderPaymentMethods from './OrderPaymentMethods';
import InstantPaymentMethods from './InstantPaymentMethods';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useBrandLogoConfiguration } from './useBrandLogoConfiguration';

interface PaymentMethodListProps {
    paymentMethods: UIElement[];
    activePaymentMethod?: UIElement;
    instantPaymentMethods?: UIElement[];
    /**
     * Map that keeps track of which Payment methods (UIElements) already got rendered in the UI
     */
    cachedPaymentMethods: Record<string, boolean>;
    order?: Order;
    orderStatus?: OrderStatus;
    openFirstStoredPaymentMethod?: boolean;
    openFirstPaymentMethod?: boolean;
    showRemovePaymentMethodButton?: boolean;

    onSelect?: (paymentMethod: UIElement) => void;
    onDisableStoredPaymentMethod?: (storedPaymentMethod) => void;
    onOrderCancel?: (order) => void;

    isDisablingPaymentMethod?: boolean;
    isLoading: boolean;
}

class PaymentMethodList extends Component<PaymentMethodListProps> {
    public static defaultProps: PaymentMethodListProps = {
        instantPaymentMethods: [],
        paymentMethods: [],
        activePaymentMethod: null,
        cachedPaymentMethods: {},
        orderStatus: null,
        onSelect: () => {},
        onDisableStoredPaymentMethod: () => {},
        isDisablingPaymentMethod: false,
        isLoading: false
    };

    componentDidMount() {
        // Open first PaymentMethodItem
        if (this.props.paymentMethods[0]) {
            const firstPaymentMethod = this.props.paymentMethods[0];
            const shouldOpenFirstStored = this.props.openFirstStoredPaymentMethod && getProp(firstPaymentMethod, 'props.oneClick') === true;
            const shouldOpenFirstPaymentMethod = shouldOpenFirstStored || this.props.openFirstPaymentMethod;

            if (shouldOpenFirstPaymentMethod) {
                this.props.onSelect(firstPaymentMethod);
            }
        }
    }

    render({ paymentMethods, instantPaymentMethods, activePaymentMethod, cachedPaymentMethods, isLoading, isDisablingPaymentMethod }) {
        const { i18n } = useCoreContext();

        const paymentMethodListClassnames = classNames({
            [styles['adyen-checkout__payment-methods-list']]: true,
            'adyen-checkout__payment-methods-list': true,
            'adyen-checkout__payment-methods-list--loading': isLoading
        });

        const brandLogoConfiguration = useBrandLogoConfiguration(paymentMethods);
        const showContentSeparator = paymentMethods?.length > 0;

        return (
            <Fragment>
                {this.props.orderStatus && (
                    <OrderPaymentMethods
                        order={this.props.order}
                        orderStatus={this.props.orderStatus}
                        onOrderCancel={this.props.onOrderCancel}
                        brandLogoConfiguration={brandLogoConfiguration}
                    />
                )}

                {!!instantPaymentMethods.length && (
                    <InstantPaymentMethods showContentSeparator={showContentSeparator} paymentMethods={instantPaymentMethods} />
                )}

                <ul className={paymentMethodListClassnames} role="radiogroup" aria-label={i18n.get('paymentMethodsList.aria.label')} required>
                    {paymentMethods.map((paymentMethod, index, paymentMethodsCollection) => {
                        const isSelected = activePaymentMethod && activePaymentMethod._id === paymentMethod._id;
                        const isLoaded = paymentMethod._id in cachedPaymentMethods;
                        const isNextOneSelected =
                            activePaymentMethod &&
                            paymentMethodsCollection[index + 1] &&
                            activePaymentMethod._id === paymentMethodsCollection[index + 1]._id;

                        return (
                            <PaymentMethodItem
                                className={classNames({ 'adyen-checkout__payment-method--next-selected': isNextOneSelected })}
                                standalone={paymentMethods.length === 1}
                                paymentMethod={paymentMethod}
                                isSelected={isSelected}
                                isDisablingPaymentMethod={isSelected && isDisablingPaymentMethod}
                                isLoaded={isLoaded}
                                isLoading={isLoading}
                                onSelect={this.props.onSelect}
                                key={paymentMethod._id}
                                showRemovePaymentMethodButton={this.props.showRemovePaymentMethodButton}
                                onDisableStoredPaymentMethod={this.props.onDisableStoredPaymentMethod}
                            />
                        );
                    })}
                </ul>
            </Fragment>
        );
    }
}

export default PaymentMethodList;
