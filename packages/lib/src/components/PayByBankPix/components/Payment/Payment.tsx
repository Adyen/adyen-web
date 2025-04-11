import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { PaymentProps } from './types';
import PaymentDetails from '../../../internal/Voucher';
import useImage from '../../../../core/Context/useImage';
import PayButton from '../../../internal/PayButton';
import './Payment.scss';
import getAuthorizationStatus from './getAuthorizationStatus';
import PayByBankPixAwait from '../Enrollment/components/PayByBankPixAwait';

function Payment({
    onPay,
    type,
    countdownTime,
    receiver,
    amount,
    txVariant,
    issuer,
    setComponentRef,
    enrollmentId,
    initiationId,
    clientKey,
    onAuthorize,
    onError
}: PaymentProps) {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState('ready');
    const [authorizationOptions, setAuthorizationOptions] = useState<string>(null);
    const buttonModifiers = ['standalone'];
    const logos = [{ name: 'Open finance', alt: i18n.get('paybybankpix.await.logoAlt.openFinance'), src: `${getImage()('openFinance')}` }];
    const details = [
        { label: i18n.get('paybybankpix.payment.receiver.label'), value: receiver },
        { label: i18n.get('paybybankpix.payment.paymentDate.label'), value: i18n.date(new Date().toString()) },
        { label: i18n.get('paybybankpix.payment.paymentMethod.label'), value: 'Pix Open Finance' }
    ];
    const self = useRef({
        setStatus
    });

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

    return type === 'await' ? (
        <PayByBankPixAwait
            logos={logos}
            type={txVariant}
            countdownTime={countdownTime}
            clientKey={clientKey}
            onError={onError}
            awaitText={i18n.get('paybybankpix.await.fetchDetails')}
            pollStatus={pollStatus}
        ></PayByBankPixAwait>
    ) : (
        <Fragment>
            <PaymentDetails
                issuerImageUrl={getImage({ imageFolder: `${txVariant}/` })(issuer)}
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
