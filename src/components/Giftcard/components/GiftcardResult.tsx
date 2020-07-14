import { h } from 'preact';
import './GiftcardResult.scss';
import getImage from '../../../utils/get-image';

function GiftcardResult({ i18n, loadingContext, paymentMethodType, ...props }) {
    return (
        <div className="adyen-checkout__giftcard-result">
            <div className="adyen-checkout__giftcard-result__header">
                <div className="adyen-checkout__giftcard-result__header__title">
                    <span className="adyen-checkout__payment-method__image__wrapper adyen-checkout__payment-method__image__wrapper--loaded">
                        <img
                            alt={paymentMethodType}
                            className="adyen-checkout__payment-method__image"
                            src={getImage({ loadingContext })(paymentMethodType)}
                        />
                    </span>
                    <span className="adyen-checkout__giftcard-result__name" aria-hidden="true">
                        •••• {props.lastFour}
                    </span>
                </div>
            </div>
            <ul className="adyen-checkout__giftcard-result__balance">
                <li className="adyen-checkout__giftcard-result__balance__item">
                    <span className="adyen-checkout__giftcard-result__balance__title">Deducted amount:</span>
                    <span className="adyen-checkout__giftcard-result__balance__value adyen-checkout__giftcard-result__balance__value--amount">
                        {i18n.amount(props.deductedAmount.value, props.deductedAmount.currencyCode)}
                    </span>
                </li>
                <li className="adyen-checkout__giftcard-result__balance__item adyen-checkout__giftcard-result__balance__item--remaining-balance">
                    <span className="adyen-checkout__giftcard-result__balance__title">Remaining balance:</span>
                    <span className="adyen-checkout__giftcard-result__balance__value">
                        {i18n.amount(props.remainingBalance.value, props.remainingBalance.currencyCode)}
                    </span>
                </li>
            </ul>
        </div>
    );
}

export default GiftcardResult;
