import { Fragment, h } from 'preact';
import getProp from '../../../../utils/getProp';
import UIElement from '../../../internal/UIElement/UIElement';
import { Order, OrderStatus } from '../../../../types/global-types';
import OrderPaymentMethods from './OrderPaymentMethods';
import InstantPaymentMethods from './InstantPaymentMethods';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useBrandLogoConfiguration } from './useBrandLogoConfiguration';
import PaymentMethodsContainer, { PaymentMethodsContainerProps } from './PaymentMethodsContainer';
import { useEffect } from 'preact/hooks';

interface PaymentMethodListProps extends Omit<PaymentMethodsContainerProps, 'label' | 'classNameModifiers'> {
    instantPaymentMethods?: UIElement[];
    storedPaymentMethods?: UIElement[];
    openFirstStoredPaymentMethod?: boolean;
    openFirstPaymentMethod?: boolean;
    order?: Order;
    orderStatus?: OrderStatus;
    onOrderCancel?: (order) => void;
}

const PaymentMethodList = ({
    paymentMethods = [], // Non-stored payments
    instantPaymentMethods = [],
    storedPaymentMethods = [],
    openFirstStoredPaymentMethod,
    openFirstPaymentMethod,
    order,
    orderStatus = null,
    onOrderCancel,
    onSelect = () => {},
    ...rest
}: PaymentMethodListProps) => {
    const { i18n } = useCoreContext();
    const brandLogoConfiguration = useBrandLogoConfiguration(paymentMethods);
    const hasInstantPaymentMethods = instantPaymentMethods.length > 0;
    const hasStoredPaymentMethods = storedPaymentMethods.length > 0;
    const pmListLabel = hasInstantPaymentMethods || hasStoredPaymentMethods ? i18n.get('paymentMethodsList.otherPayments.label') : '';

    useEffect(() => {
        // Open first PaymentMethodItem
        const firstStoredPayment = storedPaymentMethods[0];
        const firstNonStoredPayment = paymentMethods[0];

        if (firstStoredPayment || firstNonStoredPayment) {
            const shouldOpenFirstStored = openFirstStoredPaymentMethod && getProp(firstStoredPayment, 'props.oneClick') === true;
            if (shouldOpenFirstStored) {
                onSelect(firstStoredPayment);
                return;
            }

            if (openFirstPaymentMethod) {
                onSelect(firstNonStoredPayment);
            }
        }
    }, [storedPaymentMethods, paymentMethods, openFirstStoredPaymentMethod, openFirstPaymentMethod]);

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

            {hasInstantPaymentMethods && <InstantPaymentMethods paymentMethods={instantPaymentMethods} />}

            {hasStoredPaymentMethods && (
                <PaymentMethodsContainer
                    {...rest}
                    label={i18n.get('paymentMethodsList.storedPayments.label')}
                    classNameModifiers={['storedPayments']}
                    paymentMethods={storedPaymentMethods}
                    onSelect={onSelect}
                ></PaymentMethodsContainer>
            )}

            {!!paymentMethods.length && (
                <PaymentMethodsContainer
                    {...rest}
                    label={pmListLabel}
                    classNameModifiers={['otherPayments']}
                    paymentMethods={paymentMethods}
                    onSelect={onSelect}
                ></PaymentMethodsContainer>
            )}
        </Fragment>
    );
};

export default PaymentMethodList;
