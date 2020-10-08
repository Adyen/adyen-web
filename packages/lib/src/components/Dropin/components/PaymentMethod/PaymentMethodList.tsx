import { Component, Fragment, h } from 'preact';
import classNames from 'classnames';
import PaymentMethodItem from './PaymentMethodItem';
import getProp from '../../../../utils/getProp';
import styles from '../DropinComponent.module.scss';
import UIElement from '../../../UIElement';
import { Order, OrderStatus } from '../../../../types';
import OrderPaymentMethods from './OrderPaymentMethods';

interface PaymentMethodListProps {
    paymentMethods: UIElement[];
    activePaymentMethod: UIElement;
    cachedPaymentMethods: object;
    order?: Order;
    orderStatus: OrderStatus;
    openFirstStoredPaymentMethod?: boolean;
    openFirstPaymentMethod?: boolean;
    showRemovePaymentMethodButton?: boolean;

    onSelect: (paymentMethod) => void;
    onDisableStoredPaymentMethod: (storedPaymentMethod) => void;
    onOrderCancel?: (order) => void;

    isDisabling: boolean;
    isLoading: boolean;
}

class PaymentMethodList extends Component<PaymentMethodListProps> {
    public static defaultProps: PaymentMethodListProps = {
        paymentMethods: [],
        activePaymentMethod: null,
        cachedPaymentMethods: {},
        orderStatus: null,
        onSelect: () => {},
        onDisableStoredPaymentMethod: () => {},
        isDisabling: false,
        isLoading: false
    };

    componentDidMount() {
        // Open first PaymentMethodItem
        if (this.props.paymentMethods[0]) {
            const firstPaymentMethod = this.props.paymentMethods[0];
            const shouldOpenFirstStored = this.props.openFirstStoredPaymentMethod && getProp(firstPaymentMethod, 'props.oneClick') === true;
            const shouldOpenFirstPaymentMethod = shouldOpenFirstStored || this.props.openFirstPaymentMethod;

            if (shouldOpenFirstPaymentMethod) {
                this.onSelect(firstPaymentMethod)();
            }
        }
    }

    public onSelect = paymentMethod => () => this.props.onSelect(paymentMethod);

    render({ paymentMethods, activePaymentMethod, cachedPaymentMethods, isLoading }) {
        const paymentMethodListClassnames = classNames({
            [styles['adyen-checkout__payment-methods-list']]: true,
            'adyen-checkout__payment-methods-list': true,
            'adyen-checkout__payment-methods-list--loading': isLoading
        });

        return (
            <Fragment>
                {this.props.orderStatus && (
                    <OrderPaymentMethods order={this.props.order} orderStatus={this.props.orderStatus} onOrderCancel={this.props.onOrderCancel} />
                )}

                <ul className={paymentMethodListClassnames}>
                    {paymentMethods.map((paymentMethod, index, paymentMethodsCollection) => {
                        const isSelected = activePaymentMethod && activePaymentMethod.props.id === paymentMethod.props.id;
                        const isLoaded = paymentMethod.props.id in cachedPaymentMethods;
                        const isNextOneSelected =
                            activePaymentMethod &&
                            paymentMethodsCollection[index + 1] &&
                            activePaymentMethod.props.id === paymentMethodsCollection[index + 1].props.id;

                        return (
                            <PaymentMethodItem
                                className={classNames({ 'adyen-checkout__payment-method--next-selected': isNextOneSelected })}
                                standalone={paymentMethods.length === 1}
                                paymentMethod={paymentMethod}
                                isSelected={isSelected}
                                isDisabling={isSelected && this.props.isDisabling}
                                isLoaded={isLoaded}
                                isLoading={isLoading}
                                onSelect={this.onSelect(paymentMethod)}
                                key={paymentMethod.props.id}
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
