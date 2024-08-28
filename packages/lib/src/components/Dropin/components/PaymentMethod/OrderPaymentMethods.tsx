import { h } from 'preact';
import PaymentMethodIcon from './PaymentMethodIcon';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import './OrderPaymentMethods.scss';
import { Order, OrderStatus } from '../../../../types';

type OrderPaymentMethodsProps = {
    order: Order;
    orderStatus: OrderStatus;
    onOrderCancel: (order) => void;
    brandLogoConfiguration: any;
};

export const OrderPaymentMethods = ({ order, orderStatus, onOrderCancel, brandLogoConfiguration }: OrderPaymentMethodsProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <div>
            <ul className={'adyen-checkout__order-payment-methods-list'}>
                {orderStatus?.paymentMethods?.map((orderPaymentMethod, index) => (
                    <li key={`${orderPaymentMethod.type}-${index}`} className="adyen-checkout__order-payment-method">
                        <div className="adyen-checkout__order-payment-method__header">
                            <div className="adyen-checkout__payment-method__header__title">
                                <PaymentMethodIcon
                                    altDescription={orderPaymentMethod.name}
                                    type={orderPaymentMethod.type}
                                    src={brandLogoConfiguration[orderPaymentMethod.type] || getImage()(orderPaymentMethod.type)}
                                />
                                {orderPaymentMethod.label ? `${orderPaymentMethod.label}` : `•••• ${orderPaymentMethod.lastFour}`}
                            </div>

                            {onOrderCancel && (
                                <button
                                    type="button"
                                    className="adyen-checkout__button adyen-checkout__button--inline adyen-checkout__button--link"
                                    onClick={() => {
                                        onOrderCancel({ order });
                                    }}
                                >
                                    {i18n.get('storedPaymentMethod.disable.button')}
                                </button>
                            )}
                        </div>
                        <div className="adyen-checkout__order-payment-method__details">
                            <div className="adyen-checkout__order-payment-method__deducted-amount">
                                <div className="adyen-checkout__order-payment-method__deducted-amount__label">{i18n.get('deductedBalance')}</div>
                                <div className="adyen-checkout__order-payment-method__deducted-amount__value">
                                    {i18n.amount(orderPaymentMethod.amount.value, orderPaymentMethod.amount.currency)}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {orderStatus.remainingAmount && (
                <div className="adyen-checkout__order-remaining-amount">
                    {i18n.get('partialPayment.warning')}{' '}
                    <strong>{i18n.amount(orderStatus.remainingAmount.value, orderStatus.remainingAmount.currency)}</strong>
                </div>
            )}
        </div>
    );
};

export default OrderPaymentMethods;
