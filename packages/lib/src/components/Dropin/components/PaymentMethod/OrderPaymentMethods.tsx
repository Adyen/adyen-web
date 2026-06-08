import { h } from 'preact';
import PaymentMethodIcon from './PaymentMethodIcon';
import Button from '../../../internal/Button';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import './OrderPaymentMethods.scss';
import { Order, OrderStatus } from '../../../../types';
import { stopPropagationForActionKeys } from '../../../internal/Button/stopPropagationForActionKeys';

type OrderPaymentMethodsProps = {
    order: Order;
    orderStatus: OrderStatus;
    onOrderCancel: (order) => void;
    brandLogoConfiguration: any;
};

export const OrderPaymentMethods = ({ order, orderStatus, onOrderCancel, brandLogoConfiguration }: Readonly<OrderPaymentMethodsProps>) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <div>
            <ul className={'adyen-checkout__order-payment-methods-list'}>
                {orderStatus?.paymentMethods?.map((orderPaymentMethod, index) => (
                    <li key={`${orderPaymentMethod.type}-${index}`} className="adyen-checkout__order-payment-method">
                        <div className="adyen-checkout__order-payment-method__header">
                            <div
                                className="adyen-checkout__payment-method__header__title"
                                role="group"
                                id={`order-payment-method-${orderPaymentMethod.type}-${index}`}
                                aria-label={
                                    orderPaymentMethod.lastFour
                                        ? i18n.get('order.paymentMethod.description', {
                                              values: {
                                                  name: orderPaymentMethod.name ?? orderPaymentMethod.type,
                                                  lastFour: orderPaymentMethod.lastFour.toString().split('').join(' ')
                                              }
                                          })
                                        : undefined
                                }
                            >
                                <PaymentMethodIcon
                                    alt={orderPaymentMethod.name}
                                    type={orderPaymentMethod.type}
                                    src={brandLogoConfiguration[orderPaymentMethod.type] || getImage()(orderPaymentMethod.type)}
                                />
                                {orderPaymentMethod.label ? `${orderPaymentMethod.label}` : `•••• ${orderPaymentMethod.lastFour}`}
                            </div>

                            {onOrderCancel && (
                                <Button
                                    inline
                                    variant="link"
                                    id={`order-payment-method-remove-${orderPaymentMethod.type}-${index}`}
                                    ariaLabelledBy={
                                        orderPaymentMethod.lastFour
                                            ? `order-payment-method-${orderPaymentMethod.type}-${index} order-payment-method-remove-${orderPaymentMethod.type}-${index}`
                                            : undefined
                                    }
                                    label={i18n.get('storedPaymentMethod.disable.button')}
                                    onKeyPress={stopPropagationForActionKeys}
                                    onKeyDown={stopPropagationForActionKeys}
                                    onClick={() => {
                                        onOrderCancel({ order });
                                    }}
                                />
                            )}
                        </div>
                        <div className="adyen-checkout__order-payment-method__details">
                            <div className="adyen-checkout__order-payment-method__deducted-amount">
                                <span className="adyen-checkout__order-payment-method__deducted-amount__label">{i18n.get('deductedBalance')}</span>
                                <span className="adyen-checkout__order-payment-method__deducted-amount__value">
                                    {i18n.amount(orderPaymentMethod.amount.value, orderPaymentMethod.amount.currency)}
                                </span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {orderStatus.remainingAmount && (
                <p className="adyen-checkout__order-remaining-amount">
                    {i18n.get('partialPayment.warning')}{' '}
                    <strong>{i18n.amount(orderStatus.remainingAmount.value, orderStatus.remainingAmount.currency)}</strong>
                </p>
            )}
        </div>
    );
};

export default OrderPaymentMethods;
