import { Fragment, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, components } from '../../../../src';
import DropinComponent from '../../../../src/components/Dropin/Dropin';
import { createSession } from '../../../helpers/checkout-api-calls';
import { RETURN_URL, STORYBOOK_ENVIRONMENT_URLS } from '../../../config/commonConfig';
import getCurrency from '../../../utils/get-currency';
import { getSearchParameter } from '../../../utils/get-query-parameters';
import type { Core } from '../../../../src';

const { Giftcard, Card } = components;
AdyenCheckout.register(Giftcard, Card);

interface DropinGiftcardDemoProps {
    readonly countryCode: string;
    readonly shopperLocale: string;
    readonly amount: number;
    readonly sessionId?: string;
    readonly onSessionCreated?: (sessionId: string) => void;
}

function persistSessionId(sessionId: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set('sessionId', sessionId);
    window.history.replaceState({}, '', url.toString());
}

function resolveInitialSessionId(argSessionId?: string): string | null {
    return argSessionId || getSearchParameter('sessionId');
}

const DropinGiftcardDemo = ({ countryCode, shopperLocale, amount, sessionId: argSessionId, onSessionCreated }: DropinGiftcardDemoProps) => {
    const checkoutRef = useRef<Core>(null);
    const mountedRef = useRef(false);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const initCheckout = async () => {
        try {
            let session: { id: string; sessionData: string };

            const existingSessionId = resolveInitialSessionId(argSessionId);

            if (existingSessionId) {
                session = { id: existingSessionId, sessionData: null };
            } else {
                const created = await createSession({
                    amount: {
                        currency: getCurrency(countryCode),
                        value: Number(amount)
                    },
                    shopperLocale,
                    countryCode,
                    reference: `dropin-giftcard-demo-${Date.now()}`,
                    returnUrl: RETURN_URL,
                    allowedPaymentMethods: ['scheme', 'giftcard']
                });

                session = { id: created.id, sessionData: created.sessionData };

                persistSessionId(created.id);
                onSessionCreated?.(created.id);
            }

            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as any,
                countryCode,
                session,

                onPaymentCompleted: (result, element) => {
                    console.log('onPaymentCompleted', result, element);
                },

                onPaymentFailed: (result, element) => {
                    console.log('onPaymentFailed', result, element);
                },

                onError: (error, component) => {
                    if (error.name === 'CANCEL') return;
                    console.error('onError', error, component);
                },

                _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
            });

            checkoutRef.current = checkout;
            const dropin = new DropinComponent(checkout);
            dropin.mount('#dropin-giftcard-container');
            setStatus('ready');
        } catch (e) {
            console.error(e);
            setErrorMessage(String(e));
            setStatus('error');
        }
    };

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        void initCheckout();
    }, []);

    return (
        <Fragment>
            {status === 'loading' && <div>Loading session...</div>}
            {status === 'error' && <div style={{ color: 'red' }}>Error: {errorMessage}</div>}
            <div id="dropin-giftcard-container" style={{ maxWidth: '600px', margin: '0 auto' }} />
        </Fragment>
    );
};

export { DropinGiftcardDemo };
