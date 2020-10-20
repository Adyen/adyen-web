import { h } from 'preact';
import PaymentMethodIcon from './PaymentMethodIcon';
import getImage from '../../../../utils/get-image';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './OrderPaymentMethods.scss';

export const OrderPaymentMethods = ({ order, orderStatus, onOrderCancel }) => {
    const { loadingContext, i18n } = useCoreContext();

    return (
        <div>
            <ul className={'adyen-checkout__order-payment-methods-list'}>
                {orderStatus?.paymentMethods?.map((orderPaymentMethod, index) => (
                    <li key={`${orderPaymentMethod.type}-${index}`} className="adyen-checkout__order-payment-method">
                        <div className="adyen-checkout__order-payment-method__header">
                            <div className="adyen-checkout__payment-method__header__title">
                                <PaymentMethodIcon name={orderPaymentMethod.type} src={getImage({ loadingContext })(orderPaymentMethod.type)} />
                                •••• {orderPaymentMethod.lastFour}
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
