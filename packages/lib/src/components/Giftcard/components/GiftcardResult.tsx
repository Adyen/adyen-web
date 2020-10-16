import { h } from 'preact';
import './GiftcardResult.scss';
import useCoreContext from '../../../core/Context/useCoreContext';

function GiftcardResult({ brand, amount, balance, ...props }) {
    const { i18n } = useCoreContext();
    const remainingBalance = balance.value - amount.value;

    return (
        <div className="adyen-checkout__giftcard-result">
            <ul className="adyen-checkout__giftcard-result__balance">
                <li className="adyen-checkout__giftcard-result__balance__item">
                    <span className="adyen-checkout__giftcard-result__balance__title">{i18n.get('giftcardBalance')}</span>
                    <span className="adyen-checkout__giftcard-result__balance__value adyen-checkout__giftcard-result__balance__value--amount">
                        {i18n.amount(balance.value, balance.currency)}
                    </span>
                </li>
            </ul>

            {this.props.showPayButton &&
                this.props.payButton({
                    amount: this.props.amount,
                    status: props.status,
                    onClick: props.onSubmit
                })}

            <p className="adyen-checkout__giftcard-result__remaining-balance">
                {i18n.get('partialPayment.remainingBalance', {
                    values: { amount: i18n.amount(remainingBalance, balance.currency) }
                })}
            </p>
        </div>
    );
}

export default GiftcardResult;
