import { useEffect, useState } from 'preact/hooks';
import { AdyenCheckout } from '../../../../src';
import { AdditionalDetailsData } from '../../../../src/core/types';
import { makeDetailsCall } from '../../../helpers/checkout-api-calls';
import { handleError, handleFinalState } from '../../../helpers/checkout-handlers';

export const SimulatedMerchantPage = ({ redirectResult, sessionId, countryCode }) => {
    const [isRedirecting, setIsRedirecting] = useState<boolean>(true);
    let message = isRedirecting ? 'Submitting details...' : '';

    useEffect(() => {
        if (!redirectResult) {
            message = 'There is no redirectResult provided';
            return;
        }

        void AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            // @ts-ignore CLIENT_ENV has valid value
            environment: process.env.CLIENT_ENV,
            countryCode,
            ...(sessionId && { session: { id: sessionId, countryCode } }),
            // Advanced flow
            ...(!sessionId && {
                onAdditionalDetails: (state: AdditionalDetailsData, _, actions) => {
                    makeDetailsCall(state.data)
                        .then(res => {
                            actions.resolve(res);
                        })
                        .catch(e => {
                            console.error({ e });
                            actions.reject();
                        });
                }
            }),
            onPaymentCompleted: (result, component) => {
                setIsRedirecting(false);
                handleFinalState(result, component);
            },
            onPaymentFailed: (result, component) => {
                setIsRedirecting(false);
                handleFinalState(result, component);
            },
            onError: (error, component) => {
                setIsRedirecting(false);
                handleError(error, component);
            }
        }).then(checkout => {
            setIsRedirecting(true);
            checkout.submitDetails({ details: { redirectResult } });
        });
    }, [sessionId, redirectResult]);

    return (
        <div id="component-root" className="component-wrapper">
            {message}
        </div>
    );
};
