import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { PaymentProps } from './types';
import PaymentDetails from '../../../internal/Voucher';
import useImage from '../../../../core/Context/useImage';
import PayButton from '../../../internal/PayButton';
import './Payment.scss';
import getAuthOptions from './getAuthOptions';

function Payment({
    onPay,
    receiver,
    paymentDate,
    paymentMethod,
    amount,
    txVariant,
    issuer,
    setComponentRef,
    enrollmentId,
    initiationId,
    clientKey,
    onAuthenticate
}: PaymentProps) {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState('ready');
    const [authenticationOptions, setAuthenticationOptions] = useState<string>(null);
    const buttonModifiers = ['standalone'];
    const details = [
        { label: i18n.get('paybybankpix.payment.receiver.label'), value: receiver },
        { label: i18n.get('paybybankpix.payment.paymentDate.label'), value: paymentDate },
        { label: i18n.get('paybybankpix.payment.paymentMethod.label'), value: paymentMethod }
    ];
    const self = useRef({
        setStatus
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pollStatus = async () => {
        if (authenticationOptions) return;

        const response = await getAuthOptions({ enrollmentId, initiationId, clientKey, loadingContext });
        if (response.authenticationOptions) {
            setAuthenticationOptions(response.authenticationOptions);
        }
        return response;
    };

    useEffect(() => {
        setComponentRef(self.current);
    }, [setComponentRef]);

    useEffect(() => {
        if (authenticationOptions) {
            onAuthenticate(authenticationOptions);
        }
    }, [authenticationOptions]);

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
