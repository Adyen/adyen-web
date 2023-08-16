import { h, Fragment } from 'preact';
import { useEffect, useState, useMemo } from 'preact/hooks';
import {
    DelegatedAuthenticationEnrollmentInputData,
    DelegatedAuthenticationEnrollmentOutputData,
    DelegatedAuthenticationEnrollmentProps,
    DelegatedAuthenticationError
} from './types';
import { createChallengeResolveData, createOldChallengeResolveData, isInIframe } from '../utils';
import { decodeBase64, encodeBase64 } from './utils';
import Button from '../../../internal/Button';

const DelegatedAuthenticationEnrollment = ({
    token,
    useOriginalFlow,
    dataKey,
    authorisationToken,
    onComplete
}: DelegatedAuthenticationEnrollmentProps) => {
    const [status, setStatus] = useState<string>('loading');
    const [paymentCredential, setPaymentCredential] = useState<PublicKeyCredential>(null);
    const [registrationData, setRegistrationData] = useState<DelegatedAuthenticationEnrollmentInputData>(null);
    const [supported, setSupported] = useState<boolean>();
    const [spcSupported, setSpcSupported] = useState<boolean>();

    const inIframe = useMemo(() => {
        return isInIframe();
    }, []);

    const complete = (sdkOutput: string) => {
        setStatus('loading');
        const resolveDataFunction = useOriginalFlow ? createOldChallengeResolveData : createChallengeResolveData;
        const data = resolveDataFunction(dataKey, 'Y', authorisationToken, sdkOutput);
        onComplete(data);
    };

    const completeWithErrorCode = (errorCode: number) => {
        const sdkOutput = encodeDelegatedAuthenticationEnrollmentOutputData({ errorCode });
        complete(sdkOutput);
    };

    const completeWithErrorDescription = (errorDescription: string) => {
        const sdkOutput = encodeDelegatedAuthenticationEnrollmentOutputData({ errorDescription });
        complete(sdkOutput);
    };

    useEffect(() => {
        const checkSupported = async () => {
            try {
                if (!window.PublicKeyCredential) {
                    completeWithErrorCode(DelegatedAuthenticationError.WebauthnNotSupported);
                }

                const uvpaAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                // we only want to perform browser DA on devices with a platform authenticator
                if (!uvpaAvailable) {
                    completeWithErrorCode(DelegatedAuthenticationError.NoPlatformAuthenticator);
                }

                const supportsSpc = await isSpcSupported();
                if (inIframe && !supportsSpc) {
                    // merchant has an iframe integration meaning we can only do spc,
                    // but spc is not supported, so do not enroll credential
                    completeWithErrorCode(DelegatedAuthenticationError.SPCNotSupported);
                }

                setSpcSupported(supportsSpc);
                setSupported(true);
            } catch (e) {
                console.error(e);
                completeWithErrorCode(DelegatedAuthenticationError.Unknown);
            }
        };

        checkSupported();
    }, []);

    useEffect(() => {
        if (!supported) {
            return;
        }

        if (!token) {
            completeWithErrorCode(DelegatedAuthenticationError.NoInputDataPresent);
        }

        try {
            const parsedRegistrationData = parseEnrollmentData(token);
            setRegistrationData(parsedRegistrationData);
        } catch (e) {
            completeWithErrorDescription(e.message);
        }
    }, [supported]);

    useEffect(() => {
        setStatus('start');
    }, [registrationData]);

    useEffect(() => {
        if (!paymentCredential) {
            return;
        }

        setCredentialCookie(paymentCredential.id);
        submitPaymentCredential(paymentCredential);
    }, [paymentCredential]);

    const parseEnrollmentData = (enrollmentDataString: string) => {
        const decodedEnrollmentDataString = new TextDecoder().decode(decodeBase64(enrollmentDataString));
        return JSON.parse(decodedEnrollmentDataString);
    };

    const isSpcSupported = async () => {
        if (!window.PaymentRequest) {
            return false;
        }

        try {
            return await mockPaymentRequest().canMakePayment();
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const mockPaymentRequest = () => {
        const textEncoder = new TextEncoder();
        return new PaymentRequest(
            [
                {
                    supportedMethods: 'secure-payment-confirmation',
                    data: {
                        action: 'authenticate',
                        credentialIds: [textEncoder.encode('0')],
                        instrument: {
                            displayName: 'Display name',
                            icon: 'https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/visa.svg'
                        },
                        rpId: 'adyen.com',
                        challenge: textEncoder.encode('0'),
                        timeout: 6000,
                        payeeOrigin: 'https://adyen.com'
                    }
                }
            ],
            {
                total: { label: 'Total', amount: { currency: 'USD', value: '0.01' } }
            }
        );
    };

    const setCredentialCookie = (credentialId: string) => {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 100); // expire in 100 years
        document.cookie = `${credentialId}=; path=/; expires=${expiryDate.toUTCString()};`;
    };

    const createPaymentCredential = async (registrationData: DelegatedAuthenticationEnrollmentInputData): Promise<PublicKeyCredential> => {
        const publicKeyCredentialCreationOptions = registrationData.publicKeyCredentialCreationOptions;
        const challenge = Uint8Array.from(atob(publicKeyCredentialCreationOptions.challenge.value), c => c.charCodeAt(0));
        const rp = publicKeyCredentialCreationOptions.rp;
        const timeout = publicKeyCredentialCreationOptions.timeout;

        const pubKeyCredParams = publicKeyCredentialCreationOptions.pubKeyCredParams.map(param => {
            return {
                type: 'public-key',
                alg: param.alg.value
            };
        });

        const user = {
            id: Uint8Array.from(atob(publicKeyCredentialCreationOptions.user.id), c => c.charCodeAt(0)),
            name: publicKeyCredentialCreationOptions.user.name,
            displayName: publicKeyCredentialCreationOptions.user.displayName
        };

        const authenticatorSelection: AuthenticatorSelectionCriteria = {
            authenticatorAttachment: 'platform'
        };

        const publicKey = {
            challenge,
            rp,
            pubKeyCredParams,
            user,
            timeout,
            authenticatorSelection
        } as PublicKeyCredentialCreationOptions;

        if (spcSupported) {
            // if spc is supported, we need to add some additional data to the create request
            authenticatorSelection.residentKey = 'required';
            authenticatorSelection.userVerification = 'required';
            publicKey.extensions = {
                // @ts-ignore SPC is specific to Chrome and does not have a type declaration for its extension
                payment: {
                    isPayment: true
                }
            };
        }

        return (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;
    };

    const startRegistration = async () => {
        try {
            const createdPaymentCredential = await createPaymentCredential(registrationData);
            setPaymentCredential(createdPaymentCredential);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const submitPaymentCredential = paymentCredential => {
        try {
            const attestationObject = encodeBase64(paymentCredential.response.attestationObject);
            const clientDataJSON = encodeBase64(paymentCredential.response.clientDataJSON);
            const outputData: DelegatedAuthenticationEnrollmentOutputData = {
                credential: {
                    id: paymentCredential.id,
                    type: paymentCredential.type,
                    response: {
                        attestationObject,
                        clientDataJSON
                    },
                    clientExtensionResults: paymentCredential.getClientExtensionResults()
                }
            };
            complete(encodeDelegatedAuthenticationEnrollmentOutputData(outputData));
        } catch (e) {
            completeWithErrorDescription(e.message);
        }
    };

    const encodeDelegatedAuthenticationEnrollmentOutputData = (data: DelegatedAuthenticationEnrollmentOutputData): string => {
        return btoa(JSON.stringify(data));
    };

    const onCancel = () => {
        completeWithErrorCode(DelegatedAuthenticationError.Canceled);
    };

    if (status === 'loading') {
        return null;
    }

    return (
        <div style={{ padding: '24px 24px 16px' }}>
            {(status === 'start' || status === 'error') && (
                <Fragment>
                    <Button onClick={() => startRegistration()}>Enroll</Button>
                    <Button onClick={onCancel}>Cancel</Button>
                </Fragment>
            )}
        </div>
    );
};

export default DelegatedAuthenticationEnrollment;
