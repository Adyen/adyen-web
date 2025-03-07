import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { PaymentProps } from './types';
import PaymentDetails from '../../../internal/Voucher';
import useImage from '../../../../core/Context/useImage';
import PayButton from '../../../internal/PayButton';
import './Payment.scss';
import getAuthorizationStatus from './getAuthorizationStatus';

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
    onAuthorize
}: PaymentProps) {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState('ready');
    const [authorizationOptions, setAuthorizationOptions] = useState<string>(null);
    const buttonModifiers = ['standalone'];
    const details = [
        { label: i18n.get('paybybankpix.payment.receiver.label'), value: receiver },
        { label: i18n.get('paybybankpix.payment.paymentDate.label'), value: paymentDate },
        { label: i18n.get('paybybankpix.payment.paymentMethod.label'), value: paymentMethod }
    ];
    const self = useRef({
        setStatus
    });

    // todo: this function will be used by Await add later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pollStatus = async () => {
        if (authorizationOptions) return;

        const response = await getAuthorizationStatus({ enrollmentId, initiationId, clientKey, loadingContext });
        if (response.authorizationOptions) {
            setAuthorizationOptions(response.authorizationOptions);
        }
        return response;
    };

    useEffect(() => {
        setComponentRef(self.current);
    }, [setComponentRef]);

    useEffect(() => {
        if (authorizationOptions) {
            onAuthorize(authorizationOptions);
        }
    }, [authorizationOptions]);

    return (
        // todo: add Await
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
