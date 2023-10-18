import { Fragment, h } from 'preact';
import classNames from 'classnames';
import PaymentMethodItem from './PaymentMethodItem';
import getProp from '../../../../utils/getProp';
import UIElement from '../../../UIElement';
import { Order, OrderStatus } from '../../../../types';
import OrderPaymentMethods from './OrderPaymentMethods';
import InstantPaymentMethods from './InstantPaymentMethods';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useBrandLogoConfiguration } from './useBrandLogoConfiguration';
import { useEffect } from 'preact/hooks';

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

const PaymentMethodList = ({
    paymentMethods = [],
    instantPaymentMethods = [],
    activePaymentMethod = null,
    cachedPaymentMethods = {},
    isLoading = false,
    isDisablingPaymentMethod = false,
    openFirstStoredPaymentMethod,
    openFirstPaymentMethod,
    showRemovePaymentMethodButton,
    orderStatus = null,
    order,
    onOrderCancel,
    onDisableStoredPaymentMethod = () => {},
    onSelect = () => {}
}: PaymentMethodListProps) => {
    const { i18n } = useCoreContext();
    const brandLogoConfiguration = useBrandLogoConfiguration(paymentMethods);

    const paymentMethodListClassnames = classNames({
        'adyen-checkout__payment-methods-list': true,
        'adyen-checkout__payment-methods-list--loading': isLoading
    });

    useEffect(() => {
        // Open first PaymentMethodItem
        if (paymentMethods[0]) {
            const firstPaymentMethod = paymentMethods[0];
            const shouldOpenFirstStored = openFirstStoredPaymentMethod && getProp(firstPaymentMethod, 'props.oneClick') === true;
            const shouldOpenFirstPaymentMethod = shouldOpenFirstStored || openFirstPaymentMethod;

            if (shouldOpenFirstPaymentMethod) {
                onSelect(firstPaymentMethod);
            }
        }
    }, []);

    return (
        <Fragment>
            {orderStatus && (
                <OrderPaymentMethods
                    order={order}
                    orderStatus={orderStatus}
                    onOrderCancel={onOrderCancel}
                    brandLogoConfiguration={brandLogoConfiguration}
                />
            )}

            {!!instantPaymentMethods.length && <InstantPaymentMethods paymentMethods={instantPaymentMethods} />}

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
                            onSelect={onSelect}
                            key={paymentMethod._id}
                            showRemovePaymentMethodButton={showRemovePaymentMethodButton}
                            onDisableStoredPaymentMethod={onDisableStoredPaymentMethod}
                        />
                    );
                })}
            </ul>
        </Fragment>
    );
};

export default PaymentMethodList;
