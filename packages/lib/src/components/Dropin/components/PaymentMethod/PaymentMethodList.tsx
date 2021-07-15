import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';
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

function PaymentMethodList(props: PaymentMethodListProps) {
    const onSelect = paymentMethod => () => props.onSelect(paymentMethod);

    useEffect(() => {
        // Open first PaymentMethodItem
        if (props.paymentMethods[0]) {
            const firstPaymentMethod = props.paymentMethods[0];
            const shouldOpenFirstStored = props.openFirstStoredPaymentMethod && getProp(firstPaymentMethod, 'props.oneClick') === true;
            const shouldOpenFirstPaymentMethod = shouldOpenFirstStored || props.openFirstPaymentMethod;

            if (shouldOpenFirstPaymentMethod) {
                onSelect(firstPaymentMethod)();
            }
        }
    }, []);

    const paymentMethodListClassnames = classNames({
        [styles['adyen-checkout__payment-methods-list']]: true,
        'adyen-checkout__payment-methods-list': true,
        'adyen-checkout__payment-methods-list--loading': props.isLoading
    });

    return (
        <Fragment>
            {props.orderStatus && <OrderPaymentMethods order={props.order} orderStatus={props.orderStatus} onOrderCancel={props.onOrderCancel} />}

            <ul className={paymentMethodListClassnames}>
                {props.paymentMethods.map((paymentMethod, index, paymentMethodsCollection) => {
                    const isSelected = props.activePaymentMethod && props.activePaymentMethod._id === paymentMethod._id;
                    const isLoaded = paymentMethod._id in props.cachedPaymentMethods;
                    const isNextOneSelected =
                        props.activePaymentMethod &&
                        paymentMethodsCollection[index + 1] &&
                        props.activePaymentMethod._id === paymentMethodsCollection[index + 1]._id;

                    return (
                        <PaymentMethodItem
                            className={classNames({ 'adyen-checkout__payment-method--next-selected': isNextOneSelected })}
                            standalone={props.paymentMethods.length === 1}
                            paymentMethod={paymentMethod}
                            isSelected={isSelected}
                            isDisabling={isSelected && props.isDisabling}
                            isLoaded={isLoaded}
                            isLoading={props.isLoading}
                            onSelect={onSelect(paymentMethod)}
                            key={paymentMethod._id}
                            showRemovePaymentMethodButton={props.showRemovePaymentMethodButton}
                            onDisableStoredPaymentMethod={props.onDisableStoredPaymentMethod}
                        />
                    );
                })}
            </ul>
        </Fragment>
    );
}

PaymentMethodList.defaultProps = {
    paymentMethods: [],
    activePaymentMethod: null,
    cachedPaymentMethods: {},
    orderStatus: null,
    onSelect: () => {},
    onDisableStoredPaymentMethod: () => {},
    isDisabling: false,
    isLoading: false
} as PaymentMethodListProps;

export default PaymentMethodList;
