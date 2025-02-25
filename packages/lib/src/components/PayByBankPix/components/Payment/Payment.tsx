import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { PaymentProps } from './types';
import PaymentDetails from '../../../internal/Voucher';
import useImage from '../../../../core/Context/useImage';
import './Payment.scss';
import PayButton from '../../../internal/PayButton';

function Payment({ onPay, receiver, paymentDate, paymentMethod, amount, txVariant, issuer }: PaymentProps) {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;
    const buttonModifiers = ['standalone'];
    const details = [
        { label: i18n.get('paybybankpix.payment.receiver.label'), value: receiver },
        { label: i18n.get('paybybankpix.payment.paymentDate.label'), value: paymentDate },
        { label: i18n.get('paybybankpix.payment.paymentMethod.label'), value: paymentMethod }
    ];

    return (
        <Fragment>
            <PaymentDetails
                issuerImageUrl={getImage()(issuer)}
                paymentMethodType={txVariant}
                amount={i18n.amount(amount.value, amount.currency)}
                voucherDetails={details}
            ></PaymentDetails>
            <PayButton
                classNameModifiers={buttonModifiers}
                label={i18n.get('paybybankpix.storedPayment.payButton.label')}
                status={status}
                amount={amount}
                onClick={onPay}
            />
        </Fragment>
    );
}

export default Payment;
