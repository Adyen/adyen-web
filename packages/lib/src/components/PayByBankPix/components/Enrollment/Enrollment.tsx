import { h } from 'preact';
import { useRef, useState, useEffect } from 'preact/hooks';
import { AwaitProps, EnrollmentProps } from './types';
import Await from '../../../internal/Await';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { IIssuerList } from '../../../internal/IssuerList/types';
import IssuerList from '../../../internal/IssuerList';
import { useIssuerWithLogo } from './useIssuerWithLogo';
import getEnrollmentStatus from './getEnrollmentStatus';

function Enrollment(props: EnrollmentProps) {
    const { i18n, loadingContext } = useCoreContext();
    const issuerListRef = useRef<IIssuerList>(null);
    const [registrationOptions, setRegistrationOptions] = useState<string>(null);

    this.showValidation = () => {
        issuerListRef.current?.showValidation();
    };

    const pollStatus = async () => {
        const { enrollmentId, clientKey } = props as AwaitProps;
        const response = await getEnrollmentStatus({ enrollmentId, clientKey, loadingContext });
        if (response.registrationOptions) {
            setRegistrationOptions(response.registrationOptions);
        }
        return response;
    };

    const isAwait = (props: EnrollmentProps): props is AwaitProps => props.type === 'await';

    useEffect(() => {
        if (registrationOptions) {
            props.onEnroll(registrationOptions);
        }
    }, [registrationOptions]);

    return (
        <div className={'adyen-checkout-pix-biometric'}>
            {isAwait(props) ? (
                <Await
                    showCountdownTimer
                    type={props.paymentMethodType}
                    countdownTime={props.countdownTime}
                    clientKey={props.clientKey}
                    onError={props.onError}
                    // todo: change the instruction message
                    messageText={'Instruction message example'}
                    awaitText={i18n.get('await.waitForConfirmation')}
                    pollStatus={pollStatus}
                    // todo: change the logo per issuer
                    brandLogo={'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/pix.svg'}
                ></Await>
            ) : (
                <IssuerList
                    items={useIssuerWithLogo({ issuers: props.issuers, txVariant: props.txVariant })}
                    onSubmitAnalytics={props.onSubmitAnalytics}
                    onChange={props.onChange}
                    payButton={props.payButton}
                    showPayButton={true}
                    ref={issuerListRef}
                ></IssuerList>
            )}
        </div>
    );
}

export default Enrollment;
