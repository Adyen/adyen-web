import { h, Fragment } from 'preact';
import classNames from 'classnames';
import { BankTransferVoucherProps } from './types';
import './BankTransferVoucher.scss';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

export default function BankTransferVoucher({ voucherDetails, className = '', ...props }: Readonly<BankTransferVoucherProps>) {
    const { i18n } = useCoreContext();
    props.onActionHandled?.({ componentType: props.paymentMethodType, actionDescription: 'voucher-presented' });

    return (
        <div
            className={classNames(
                'adyen-checkout__voucher-result',
                'adyen-checkout__voucher-result--bankTransfer',
                `adyen-checkout__voucher-result--${props.paymentMethodType}`,
                className
            )}
        >
            <div className="adyen-checkout__voucher-result__top">
                <div className="adyen-checkout__voucher-result__image">
                    {!!props.imageUrl && (
                        <span className="adyen-checkout__voucher-result__image__wrapper">
                            <img alt={props.paymentMethodType} className="adyen-checkout__voucher-result__image__brand" src={props.imageUrl} />
                        </span>
                    )}
                </div>
                {props.amount && <div className="adyen-checkout__voucher-result__amount">{props.amount}</div>}
                {props.instructions && (
                    <Fragment>
                        <div className="adyen-checkout__voucher-result-title">{i18n.get('bankTransfer.instruction.title')}</div>
                        {props.instructions}
                    </Fragment>
                )}
            </div>

            <div className="adyen-checkout__voucher-result__bottom">
                {voucherDetails && (
                    <Fragment>
                        <div className="adyen-checkout__voucher-result-title">{i18n.get('bankTransfer.details.title')}</div>
                        {voucherDetails}
                    </Fragment>
                )}
            </div>
        </div>
    );
}
