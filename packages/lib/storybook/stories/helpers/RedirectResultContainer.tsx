import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import AdyenCheckout from '../../../src';
import { handleError, handleFinalState } from '../../helpers/checkout-handlers';

export const RedirectResultContainer = ({ redirectResult, sessionId }) => {
    const [isRedirecting, setIsRedirecting] = useState<boolean>(true);
    let message = isRedirecting ? 'Submitting details...' : '';

    useEffect(() => {
        if (!redirectResult || !sessionId) {
            message = 'There is no redirectResult / sessionId provided';
            return;
        }

        AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            environment: process.env.CLIENT_ENV,
            session: { id: sessionId },
            onPaymentCompleted: (result, component) => {
                /*                if (!component) {
                    setIsRedirecting(false);
                    setResult(result);
                } else {
                    handleFinalState(result, component);
                }*/
                setIsRedirecting(false);
                handleFinalState(result, component);
            },
            onError: (error, component) => {
                //setIsRedirecting(false);
                //setResult({ resultCode: 'Error', resultMessage: `${error.name}: ${error.message}` });
                setIsRedirecting(false);
                handleError(error, component);
            }
        }).then(checkout => {
            setIsRedirecting(true);
            checkout.submitDetails({ details: { redirectResult } });
        });
    }, [sessionId]);

    return (
        <div id="component-root" className="component-wrapper">
            {message}
        </div>
    );
};
