import { useEffect, useState } from 'preact/hooks';
import { AdyenCheckout } from '../../../src';
import { handleError, handleFinalState } from '../../helpers/checkout-handlers';
import { AdditionalDetailsStateData } from '../../../src/types/global-types';
import { makeDetailsCall } from '../../helpers/checkout-api-calls';

export const RedirectResultContainer = ({ redirectResult, sessionId, countryCode }) => {
    const [isRedirecting, setIsRedirecting] = useState<boolean>(true);
    let message = isRedirecting ? 'Submitting details...' : '';

    useEffect(() => {
        if (!redirectResult && !sessionId) {
            message = 'There is no redirectResult / sessionId provided';
            return;
        }

        AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            environment: process.env.CLIENT_ENV,
            countryCode,
            ...(sessionId && { session: { id: sessionId, countryCode } }),
            // Advanced flow
            ...(!sessionId && {
                onAdditionalDetails: (state: AdditionalDetailsStateData, _, actions) => {
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
