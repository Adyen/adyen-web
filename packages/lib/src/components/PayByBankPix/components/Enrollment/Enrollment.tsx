import { h } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import { AwaitProps, EnrollmentProps } from './types';
import Await from '../../../internal/Await';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { IIssuerList } from '../../../internal/IssuerList/types';
import IssuerList from '../../../internal/IssuerList';
import { useIssuerWithLogo } from './useIssuerWithLogo';
import getEnrollmentStatus from './getEnrollmentStatus';
import { DecodeObject } from '../../../../types/global-types';
import base64 from '../../../../utils/base64';

function Enrollment(props: EnrollmentProps) {
    const { i18n, loadingContext } = useCoreContext();
    const issuerListRef = useRef<IIssuerList>(null);

    const onComplete = (): void => {
        // todo: collect biometrics and call internal endpoint
        // /details call with response of the internal endpoint
        // onError if fails
        const bla =
            'ewogICAgImFjdGlvbiI6IHsKICAgICAgICAicGF5bWVudE1ldGhvZFR5cGUiOiAicGF5YnliYW5rX3BpeCIsCiAgICAgICAgInR5cGUiOiAiYXdhaXQiLAogICAgICAgICJlbnJvbGxtZW50SWQiOiAiZW5yb2xsbWVudDEyMyIsCiAgICAgICAgInBheW1lbnREYXRhIjogIm1vY2tQYXltZW50RGF0YSIKICAgIH0KfQ==';
        const decodedResult: DecodeObject = base64.decode(bla);
        if (!decodedResult.success) {
            // onError
        } else {
            const result = JSON.parse(decodedResult.data);
            console.log({ result });
        }
    };
    const pollStatus = () => {
        const { enrollmentId, clientKey } = props as AwaitProps;
        return getEnrollmentStatus({ enrollmentId, clientKey, loadingContext });
    };

    this.showValidation = () => {
        issuerListRef.current?.showValidation();
    };

    const isAwait = (props: EnrollmentProps): props is AwaitProps => props.type === 'await';

    return (
        <div className={'adyen-checkout-pix-biometric'}>
            {isAwait(props) ? (
                <Await
                    showCountdownTimer
                    type={props.paymentMethodType}
                    countdownTime={props.countdownTime}
                    clientKey={props.clientKey}
                    onError={props.onError}
                    messageText={'Instruction message example'}
                    awaitText={i18n.get('await.waitForConfirmation')}
                    onComplete={onComplete}
                    pollStatus={pollStatus}
                    brandLogo={'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/pix.svg'}
                ></Await>
            ) : (
                <IssuerList
                    items={useIssuerWithLogo({ issuers: props.issuers, txVariant: props.txVariant })}
                    onSubmitAnalytics={props.onSubmitAnalytics}
                    onChange={props.onChange}
                    payButton={props.payButton}
                    showPayButton={props.showPayButton}
                    ref={issuerListRef}
                ></IssuerList>
            )}
        </div>
    );
}

export default Enrollment;
