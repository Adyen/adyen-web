import { h, Fragment } from 'preact';
import { useRef, useState, useEffect } from 'preact/hooks';
import { AwaitProps, EnrollmentProps } from './types';
import Await from '../../../internal/Await';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { IIssuerList } from '../../../internal/IssuerList/types';
import IssuerList from '../../../internal/IssuerList';
import { useIssuerWithLogo } from './useIssuerWithLogo';
import getEnrollmentStatus from './getEnrollmentStatus';
import DisclaimerMessage from '../../../internal/DisclaimerMessage';
import IssuerListIntroduction from './components/IssuerListIntroduction';
import AwaitLogoContainer from './components/AwaitLogoContainer';
import './Enrollment.scss';

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
    const awaitEndSlot = () => <span>{i18n.get('paybybankpix.await.withOpenFinance')}</span>;

    useEffect(() => {
        if (registrationOptions) {
            props.onEnroll(registrationOptions);
        }
    }, [registrationOptions]);

    return (
        <div className={'adyen-checkout-pix-enrollment'}>
            {isAwait(props) ? (
                <Fragment>
                    <AwaitLogoContainer />
                    <Await
                        // We want the countdown capability but the adyen-checkout__await__countdown-holder is visually hidden.
                        showCountdownTimer={true}
                        type={props.paymentMethodType}
                        countdownTime={props.countdownTime}
                        clientKey={props.clientKey}
                        onError={props.onError}
                        awaitText={i18n.get('paybybankpix.await.createPasskeys')}
                        instructions={i18n.get('paybybankpix.await.timeToPay', {
                            values: { numberOfMin: props.countdownTime }
                        })}
                        pollStatus={pollStatus}
                        endSlot={awaitEndSlot}
                    ></Await>
                </Fragment>
            ) : (
                <div className="adyen-checkout-pix-enrollment-issuer-list">
                    <IssuerListIntroduction />
                    <IssuerList
                        items={useIssuerWithLogo({ issuers: props.issuers, txVariant: props.txVariant })}
                        onSubmitAnalytics={props.onSubmitAnalytics}
                        onChange={props.onChange}
                        payButton={props.payButton}
                        showPayButton={true}
                        ref={issuerListRef}
                    ></IssuerList>
                    <DisclaimerMessage message={i18n.get('paybybankpix.issuerList.disclaimer')} />
                </div>
            )}
        </div>
    );
}

export default Enrollment;
