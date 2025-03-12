import { h } from 'preact';
import { useRef, useState, useEffect } from 'preact/hooks';
import { AwaitProps, EnrollmentProps } from './types';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { IIssuerList } from '../../../internal/IssuerList/types';
import IssuerList from '../../../internal/IssuerList';
import { useIssuerWithLogo } from './useIssuerWithLogo';
import getEnrollmentStatus from './getEnrollmentStatus';
import DisclaimerMessage from '../../../internal/DisclaimerMessage';
import IssuerListIntroduction from './components/IssuerListIntroduction';
import PayByBankPixAwait from './components/PayByBankPixAwait';
import useImage from '../../../../core/Context/useImage';
import './Enrollment.scss';

function Enrollment(props: EnrollmentProps) {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const issuerListRef = useRef<IIssuerList>(null);
    const [registrationOptions, setRegistrationOptions] = useState<string>(null);
    // todo: add
    const logos = [
        { name: 'Open finance', alt: i18n.get('paybybankpix.await.logoAlt.openFinance'), src: `${getImage()('openFinance')}` },
        { name: 'Arrow down', alt: i18n.get('paybybankpix.await.logoAlt.arrowDown'), src: `${getImage()('arrowDown')}` },
        { name: 'Bank', alt: i18n.get('paybybankpix.await.logoAlt.bank'), src: `${getImage()('bank')}` }
    ];
    const self = useRef({
        showValidation: () => {
            issuerListRef?.current?.showValidation();
        }
    });

    const pollStatus = async () => {
        if (registrationOptions) return;

        const { enrollmentId, clientKey } = props as AwaitProps;
        const response = await getEnrollmentStatus({ enrollmentId, clientKey, loadingContext });
        if (response.registrationOptions) {
            setRegistrationOptions(response.registrationOptions);
        }
        return response;
    };
    //  Assist typescript to narrow down the type.
    const isAwait = (props: EnrollmentProps): props is AwaitProps => props.type === 'await';
    const awaitEndSlot = () => <span>{i18n.get('paybybankpix.await.withOpenFinance')}</span>;

    useEffect(() => {
        props.setComponentRef(self.current);
    }, [props.setComponentRef]);

    useEffect(() => {
        if (registrationOptions) {
            props.onEnroll(registrationOptions);
        }
    }, [registrationOptions]);

    return (
        <div className={'adyen-checkout-pix-enrollment'}>
            {isAwait(props) ? (
                <PayByBankPixAwait
                    logos={logos}
                    type={props.txVariant}
                    countdownTime={props.countdownTime}
                    clientKey={props.clientKey}
                    onError={props.onError}
                    awaitText={i18n.get('paybybankpix.await.waitForConfirmation')}
                    instructions={i18n.get('paybybankpix.await.timeToPay', {
                        values: { numberOfMin: props.countdownTime }
                    })}
                    pollStatus={pollStatus}
                    endSlot={awaitEndSlot}
                ></PayByBankPixAwait>
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
