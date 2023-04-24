import classNames from 'classnames';
import { h } from 'preact';
import './PaymentMethodName.scss';

const PaymentMethodName = ({ displayName, additionalInfo, isSelected }) => (
    <div className={'adyen-checkout__payment-method__name_wrapper'}>
        <span
            className={classNames({
                'adyen-checkout__payment-method__name': true,
                'adyen-checkout__payment-method__name--selected': isSelected
            })}
        >
            {displayName}
        </span>

        <div
            className={classNames({
                'adyen-checkout__payment-method__additional-info': true,
                'adyen-checkout__payment-method__additional-info--selected': isSelected
            })}
        >
            {additionalInfo}
        </div>
    </div>
);

export default PaymentMethodName;
