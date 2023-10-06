import { Fragment, h } from 'preact';
import getProp from '../../../../utils/getProp';
import UIElement from '../../../UIElement';
import { Order, OrderStatus } from '../../../../types';
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
    paymentMethods = [],
    instantPaymentMethods = [], 
    storedPaymentMethods=[],
    openFirstStoredPaymentMethod,
    openFirstPaymentMethod,
    showRemovePaymentMethodButton,
    orderStatus = null,
    order,
    onOrderCancel,
    onSelect = () => {},
    ...rest
}: PaymentMethodListProps) => {
    const { i18n } = useCoreContext();
    const brandLogoConfiguration = useBrandLogoConfiguration(paymentMethods);

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

          {!!storedPaymentMethods.length && (
            <PaymentMethodsContainer
              {...rest}
              label={i18n.get('paymentMethodsList.storedPayments.label')}
              classNameModifiers={['storedPayments']}
              paymentMethods={storedPaymentMethods}
            ></PaymentMethodsContainer>
          )}

          {!!paymentMethods.length && (
            <PaymentMethodsContainer
              {...rest}
              label={i18n.get('paymentMethodsList.otherPayments.label')}
              classNameModifiers={['otherPayments']}
              paymentMethods={paymentMethods}
            ></PaymentMethodsContainer>
          )}
            </Fragment>
        );
};

export default PaymentMethodList;
