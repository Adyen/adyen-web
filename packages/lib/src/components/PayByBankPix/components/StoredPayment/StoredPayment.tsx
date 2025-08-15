import { h } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { PaymentProps } from './types';
import useImage from '../../../../core/Context/useImage';
import PayButton from '../../../internal/PayButton';
import './StoredPayment.scss';
import getAuthorizationStatus from './getAuthorizationStatus';
import PayByBankPixAwait from '../Enrollment/components/PayByBankPixAwait';

function StoredPayment({
    onPay,
    type,
    countdownTime,
    amount,
    txVariant,
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
    const logos = [
        {
            name: 'open-finance',
            alt: i18n.get('paybybankpix.await.logoAlt.openFinance'),
            src: `${getImage({ parentFolder: `${txVariant}/` })('open-finance')}`
        }
    ];

    const self = useRef({
        setStatus
    });

    const pollStatus = useCallback(async () => {
        if (authorizationOptions) return;

        const response = await getAuthorizationStatus({ enrollmentId, initiationId, clientKey, loadingContext });
        if (response.authorizationOptions) {
            setAuthorizationOptions(response.authorizationOptions);
        }

        return response;
    }, [authorizationOptions, enrollmentId, initiationId, clientKey, loadingContext]);

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
        <PayButton
            classNameModifiers={buttonModifiers}
            label={i18n.get('paybybankpix.redirectBtn.label')}
            status={status}
            amount={amount}
            onClick={onPay}
        />
    );
}

export default StoredPayment;
