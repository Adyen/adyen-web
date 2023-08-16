import { h } from 'preact';
import UIElement from '../../../UIElement';
import {
    DelegatedAuthenticationError,
    DelegatedAuthenticationInputData,
    DelegatedAuthenticationOutputData,
    DelegatedAuthenticationProps
} from './types';
import { decodeBase64, encodeBase64 } from './utils';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { createDelegatedAuthenticationResolveData, DelegatedAuthenticationResolveData, isInIframe } from '../utils';
import Button from '../../../internal/Button';
import { PaymentAmount } from '../../../../types';
import { httpPost } from '../../../../core/Services/http';
import { DelegatedAuthenticationResultResponse } from '../../types';

class DelegatedAuthentication extends UIElement<DelegatedAuthenticationProps> {
    public static type = 'delegatedAuthentication';

    render() {
        return <DelegatedAuthenticationImpl {...this.props} />;
    }
}

const DelegatedAuthenticationImpl = ({
    token,
    paymentData,
    onComplete,
    useOriginalFlow,
    clientKey,
    elementRef,
    loadingContext,
    challengeWindowSize
}: DelegatedAuthenticationProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [authenticationData, setAuthenticationData] = useState<DelegatedAuthenticationInputData>(null);
    const [hasCookieForCredential, setHasCookieForCredential] = useState<boolean>();

    // todo: this should be a part of the token data
    const useCookiesInSpc = true;

    const shouldDoSpc = useMemo(() => {
        return isInIframe();
    }, []);

    useEffect(() => {
        if (token) {
            try {
                const data = parseDelegatedAuthenticationData(token);
                if (!data) {
                    complete({ errorCode: DelegatedAuthenticationError.NoInputDataPresent });
                }
                setAuthenticationData(data);
            } catch (e) {
                complete({ errorCode: DelegatedAuthenticationError.Unknown, errorDescription: e.message });
            }
        } else {
            complete({ errorCode: DelegatedAuthenticationError.NoInputDataPresent });
        }
    }, []);

    useEffect(() => {
        if (!authenticationData) {
            return;
        }

        if (shouldDoSpc && !useCookiesInSpc) {
            // we are in an iframe, so we do spc, but we don't want to use cookies
            setHasCookieForCredential(false);
            return;
        }

        const cookieForCredential = hasCookieForSomeCredential(authenticationData);
        if (!cookieForCredential) {
            console.error('No cookie matching credential');
            complete({ errorCode: DelegatedAuthenticationError.NoBrowserCookie });
            return;
        }
        setHasCookieForCredential(cookieForCredential);
    }, [authenticationData]);

    useEffect(() => {
        if (!authenticationData) {
            return;
        }

        setLoading(false);
    }, [hasCookieForCredential]);

    const parseDelegatedAuthenticationData = (token: string): DelegatedAuthenticationInputData => {
        const decodedAuthenticationDataString = new TextDecoder().decode(decodeBase64(token));
        return JSON.parse(decodedAuthenticationDataString);
    };

    const hasCookieForSomeCredential = (authenticationData: DelegatedAuthenticationInputData): boolean => {
        if (!document.cookie) {
            return false;
        }

        const cookies = document.cookie.split('; ');
        const credentialIds = authenticationData.publicKeyCredentialRequestOptions.allowCredentials || [];
        return credentialIds
            .map(credential => credential.id.replaceAll('+', '-').replaceAll('/', '_').replace(/=/g, ''))
            .some(id => cookies.some(v => v.startsWith(id + '=')));
    };

    const startSpcAuthentication = async () => {
        try {
            setLoading(true);
            const paymentRequest = await buildPaymentRequestIfSupported(authenticationData);
            const instrumentResponse = await paymentRequest.show();
            await handleInstrumentResponse(instrumentResponse);
        } catch (err) {
            console.error(err);
            if (hasCookieForCredential) {
                complete({ errorCode: DelegatedAuthenticationError.Canceled });
            } else {
                complete({ errorDescription: err.message });
            }
        }
    };

    const buildPaymentRequestIfSupported = async (data: DelegatedAuthenticationInputData) => {
        if (!window.PaymentRequest) {
            throw new Error('Shopper in iframe but browser does not support SPC');
        }

        if (!data.payeeOrigin) {
            throw new Error('Shopper in iframe but payeeOrigin not provided for SPC');
        }

        const paymentRequest = buildPaymentRequest(data);
        const canPay = await paymentRequest.canMakePayment();
        if (!canPay) {
            throw new Error('Shopper in iframe but cannot perform SPC');
        }
        return paymentRequest;
    };

    const buildPaymentRequest = (authenticationData: DelegatedAuthenticationInputData): PaymentRequest => {
        const publicKeyCredentialRequestOptions = authenticationData.publicKeyCredentialRequestOptions;
        const amount = authenticationData.amount;
        const instrument = authenticationData.instrument;
        const currencyExponent = authenticationData.currencyExponent;

        const rpId = publicKeyCredentialRequestOptions.rpId;
        const storedCredentialIds = publicKeyCredentialRequestOptions.allowCredentials.map(credential => decodeBase64(credential.id));
        const challengeData = decodeBase64(publicKeyCredentialRequestOptions.challenge.value);

        const supportedInstruments = [
            {
                supportedMethods: 'secure-payment-confirmation',
                data: {
                    instrument,
                    rpId,
                    action: 'authenticate',
                    credentialIds: storedCredentialIds,
                    challenge: challengeData,
                    timeout: publicKeyCredentialRequestOptions.timeout,
                    payeeOrigin: authenticationData.payeeOrigin
                }
            }
        ];

        const details = createPaymentRequestDetails(amount, currencyExponent);

        return new PaymentRequest(supportedInstruments, details);
    };

    const handleInstrumentResponse = async (instrumentResponse: PaymentResponse) => {
        await instrumentResponse.complete('success');
        const pkCredential = instrumentResponse.details;
        const response = makeResponseFromCredential(pkCredential);
        complete(response);
    };

    const makeResponseFromCredential = (credential: PublicKeyCredential): DelegatedAuthenticationOutputData => {
        const authenticatorResponse = credential.response as AuthenticatorAssertionResponse;
        const authenticatorData = encodeBase64(authenticatorResponse.authenticatorData);
        const clientDataJSON = encodeBase64(authenticatorResponse.clientDataJSON);
        const signature = encodeBase64(authenticatorResponse.signature);

        return {
            credential: {
                id: credential.id,
                type: credential.type,
                response: {
                    clientDataJSON,
                    authenticatorData,
                    signature
                },
                clientExtensionResults: credential.getClientExtensionResults()
            }
        };
    };

    const onCancel = () => {
        complete({ errorCode: DelegatedAuthenticationError.Canceled });
    };

    const complete = (outputData: DelegatedAuthenticationOutputData) => {
        setLoading(true);
        const resolveData = createDelegatedAuthenticationResolveData(paymentData, encodeDelegatedAuthenticationOutputData(outputData));

        if (useOriginalFlow) {
            onComplete(resolveData);
        } else {
            callSubmitDelegatedAuthenticationResult(resolveData);
        }
    };

    const callSubmitDelegatedAuthenticationResult = async (resolveData: DelegatedAuthenticationResolveData) => {
        try {
            const response = await httpPost<DelegatedAuthenticationResultResponse>(
                {
                    path: `v1/submitDelegatedAuthenticationResult?token=${clientKey}`,
                    errorLevel: 'fatal',
                    loadingContext
                },
                resolveData.data.details
            );

            const actionHandler = elementRef;

            if (!actionHandler) {
                console.error('Handled Error::callSubmitDelegatedAuthenticationResult::FAILED:: actionHandler=', actionHandler);
                return;
            }

            if (!response.action && !response.details) {
                console.error('Handled Error::callSubmitDelegatedAuthenticationResult::FAILED:: resData=', response);
                return;
            }

            /**
             * Frictionless (no challenge) flow OR "refused" flow
             */
            if (response.type === 'completed') {
                const { details } = response;
                return onComplete({ data: { details } });
            }

            /**
             * Challenge flow
             */
            if (response.action?.type === 'threeDS2') {
                return actionHandler.handleAction(response.action, { challengeWindowSize });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onPay = async () => {
        try {
            const publicKeyCredentialRequestOptions = {
                challenge: decodeBase64(authenticationData.publicKeyCredentialRequestOptions.challenge.value),
                allowCredentials: authenticationData.publicKeyCredentialRequestOptions.allowCredentials.map(c => {
                    return {
                        id: decodeBase64(c.id),
                        type: 'public-key',
                        transports: ['internal'] // i.e. platform authenticator
                    } as PublicKeyCredentialDescriptor;
                }),
                rpId: authenticationData.publicKeyCredentialRequestOptions.rpId,
                timeout: authenticationData.publicKeyCredentialRequestOptions.timeout
            } as PublicKeyCredentialRequestOptions;

            const credential = (await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions })) as PublicKeyCredential;
            const response = makeResponseFromCredential(credential);
            complete(response);
        } catch (e) {
            console.error(e);
            if (hasCookieForCredential) {
                complete({ errorCode: DelegatedAuthenticationError.Canceled });
            } else {
                complete({ errorDescription: e.message });
            }
        }
    };

    const createPaymentRequestDetails = (amount: PaymentAmount, currencyExponent: number): PaymentDetailsInit => {
        return {
            total: {
                label: 'Total',
                amount: {
                    currency: amount.currency,
                    value: getAmountValue(amount, currencyExponent)
                }
            }
        };
    };

    const removeCredential = () => {
        const credentialIds = authenticationData.publicKeyCredentialRequestOptions.allowCredentials.map(credential =>
            credential.id.replaceAll('+', '-').replaceAll('/', '_').replace(/=/g, '')
        );

        credentialIds.forEach(credentialId => {
            document.cookie = `${credentialId}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        });

        complete({ errorCode: DelegatedAuthenticationError.Canceled, deleteCredential: true });
    };

    const getAmountValue = (amount: PaymentAmount, currencyExponent: number): string => {
        return (amount.value / getAmountDivisor(currencyExponent)).toString();
    };

    const getAmountDivisor = (currencyExponent: number) => {
        return parseInt('1' + '0'.repeat(currencyExponent), 10);
    };

    const encodeDelegatedAuthenticationOutputData = (data: DelegatedAuthenticationOutputData): string => {
        return btoa(JSON.stringify(data));
    };

    if (loading) {
        return null;
    }

    return (
        <div style={{ padding: '24px 24px 16px' }}>
            <Button onClick={shouldDoSpc ? startSpcAuthentication : onPay}>{'Confirm payment'}</Button>
            <Button onClick={onCancel}>{'Cancel'}</Button>
            <Button onClick={removeCredential}>{'Delete credentials'}</Button>
        </div>
    );
};

export default DelegatedAuthentication;
