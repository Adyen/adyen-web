import { h } from 'preact';
import './GiftcardResult.scss';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { PaymentAmount } from '../../../types/global-types';
import { PayButtonProps } from '../../internal/PayButton/PayButton';

interface GiftcardResultProps {
    amount: PaymentAmount;
    balance: PaymentAmount;
    transactionLimit: PaymentAmount;
    status: string;
    makePayment: () => void;
    showPayButton: boolean;
    payButton(props?: PayButtonProps): h.JSX.Element;
}

function GiftcardResult({ amount, balance, transactionLimit, status, makePayment, showPayButton, payButton }: GiftcardResultProps) {
    const { i18n } = useCoreContext();
    const transactionAmount = amount.value > transactionLimit?.value ? transactionLimit : amount;
    const remainingBalance = balance?.value - transactionAmount?.value;

    return (
        <div className="adyen-checkout__giftcard-result">
            <ul className="adyen-checkout__giftcard-result__balance">
                <li className="adyen-checkout__giftcard-result__balance__item">
                    <span className="adyen-checkout__giftcard-result__balance__title">{i18n.get('giftcardBalance')}</span>
                    <span className="adyen-checkout__giftcard-result__balance__value adyen-checkout__giftcard-result__balance__value--amount">
                        {i18n.amount(balance.value, balance.currency)}
                    </span>
                </li>
                {transactionLimit && transactionLimit.value && (
                    <li className="adyen-checkout__giftcard-result__balance__item">
                        <span className="adyen-checkout__giftcard-result__balance__title adyen-checkout__giftcard-result__balance__title--transactionLimit">
                            {i18n.get('giftcardTransactionLimit', {
                                values: { amount: i18n.amount(transactionLimit.value, transactionLimit.currency) }
                            })}
                        </span>
                    </li>
                )}
            </ul>

            {showPayButton &&
                payButton({
                    amount: transactionAmount,
                    status: status,
                    onClick: makePayment
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
