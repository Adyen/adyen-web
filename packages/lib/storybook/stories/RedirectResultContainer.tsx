import { Core } from '@adyen/adyen-web';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { handleError, handleFinalState } from '../helpers/checkout-handlers';

export const RedirectResultContainer = ({ redirectResult, sessionId, countryCode }) => {
    const [isRedirecting, setIsRedirecting] = useState<boolean>(true);
    let message = isRedirecting ? 'Submitting details...' : '';

    useEffect(() => {
        if (!redirectResult || !sessionId) {
            message = 'There is no redirectResult or session ID provided';
            return;
        }

        setIsRedirecting(true);

        const core = new Core({
            clientKey: process.env.CLIENT_KEY,
            // @ts-ignore CLIENT_ENV has valid value
            environment: process.env.CLIENT_ENV,
            countryCode,
            session: { id: sessionId },
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
        });

        core.submitDetails({ details: { redirectResult } });
    }, [sessionId, redirectResult]);

    return (
        <div id="component-root" className="component-wrapper">
            {message}
        </div>
    );
};
