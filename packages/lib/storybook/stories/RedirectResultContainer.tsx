import { Core } from '@adyen/adyen-web';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { handleError, handleFinalState } from '../helpers/checkout-handlers';

export const RedirectResultContainer = ({ redirectResult, sessionId, countryCode }) => {
    const [message, setMessage] = useState<string>('Submitting details...');

    useEffect(() => {
        if (!redirectResult || !sessionId) {
            setMessage('There is no redirectResult or session ID provided');
            return;
        }

        setMessage('Submitting details...');

        const core = new Core({
            clientKey: process.env.CLIENT_KEY,
            // @ts-ignore CLIENT_ENV has valid value
            environment: process.env.CLIENT_ENV,
            countryCode,
            session: { id: sessionId },
            onPaymentCompleted: (result, component) => {
                handleFinalState(result, component);
                setMessage('');
            },
            onPaymentFailed: (result, component) => {
                handleFinalState(result, component);
                setMessage('');
            },
            onError: (error, component) => {
                handleError(error, component);
                setMessage('');
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
