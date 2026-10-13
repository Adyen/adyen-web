import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout, components, Dropin as DropinComponent } from '@adyen/adyen-web';
import { createSession } from '../../../helpers/checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE, STORYBOOK_ENVIRONMENT_URLS } from '../../../config/commonConfig';
import getCurrency from '../../../utils/get-currency';
import type { CoreConfiguration } from '../../../../src/core/types';
import type { NewableComponent } from '../../../../src/core/core.registry';
import type { OrderUpdatedData } from '../../../../src/types';

const { Dropin, ...Components } = components;
AdyenCheckout.register(...(Object.values(Components) as NewableComponent[]));

const STORAGE_KEY = 'adyen-web-storybook:giftcard-reload-session-id';

interface GiftcardReloadDemoProps {
    amount: number;
    countryCode: string;
    shopperLocale: string;
}

/**
 * Simulates a merchant that only persists the session id. When the checkout is initialised again with just the id,
 * the SDK restores the latest `sessionData` for that session instead of a new session being created on every page load.
 */
export const GiftcardReloadDemo = ({ amount, countryCode, shopperLocale }: Readonly<GiftcardReloadDemoProps>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [initializationKey, setInitializationKey] = useState(0);
    const [persistedSessionId, setPersistedSessionId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
    const [sessionOrigin, setSessionOrigin] = useState<'new' | 'restored' | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const persistSessionId = (sessionId: string): void => {
        localStorage.setItem(STORAGE_KEY, sessionId);
        setPersistedSessionId(sessionId);
    };

    const discardSessionId = (): void => {
        localStorage.removeItem(STORAGE_KEY);
        setPersistedSessionId(null);
    };

    useEffect(() => {
        let dropin: InstanceType<typeof DropinComponent> | undefined;
        let cancelled = false;

        const init = async () => {
            setErrorMessage(null);
            setSessionOrigin(null);

            const storedSessionId = localStorage.getItem(STORAGE_KEY);
            let session: { id: string; sessionData?: string };

            if (storedSessionId) {
                session = { id: storedSessionId };
            } else {
                const response = await createSession({
                    amount: { currency: getCurrency(countryCode), value: Number(amount) },
                    shopperLocale,
                    countryCode,
                    reference: 'GIFTCARD-RELOAD',
                    returnUrl: RETURN_URL,
                    shopperReference: SHOPPER_REFERENCE,
                    shopperEmail: 'shopper.ctp1@adyen.com'
                });
                session = { id: response.id, sessionData: response.sessionData };
                persistSessionId(response.id);
            }

            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                countryCode,
                locale: shopperLocale,
                session,
                onOrderUpdated: (data: OrderUpdatedData) => {
                    console.log('onOrderUpdated', data);
                },
                onPaymentCompleted: result => {
                    console.log('onPaymentCompleted', result);
                    discardSessionId();
                },
                onPaymentFailed: result => {
                    console.log('onPaymentFailed', result);
                },
                onError: error => {
                    if (error.name === 'CANCEL') return;
                    console.error(error);
                },
                _environmentUrls: STORYBOOK_ENVIRONMENT_URLS
            });

            if (cancelled || !containerRef.current) return;

            dropin = new DropinComponent(checkout);
            dropin.mount(containerRef.current);
            setSessionOrigin(storedSessionId ? 'restored' : 'new');
        };

        init().catch((error: unknown) => {
            console.error('GiftcardReload: failed to initialise the checkout', error);
            if (cancelled) return;
            // A persisted session can expire. Drop it so the next attempt creates a fresh one
            discardSessionId();
            setErrorMessage('Could not initialise the checkout. The persisted session id was cleared, use "Reload Drop-in" to start again.');
        });

        return () => {
            cancelled = true;
            dropin?.unmount();
        };
    }, [initializationKey, countryCode, amount, shopperLocale]);

    const reloadDropin = () => setInitializationKey(key => key + 1);

    const startNewSession = () => {
        discardSessionId();
        reloadDropin();
    };

    return (
        <div>
            <p>
                1. Pay with a gift card for less than the total. 2. Reload the page (or use &quot;Reload Drop-in&quot;). Only the session id is
                persisted, and the applied gift card should be displayed after the reload. Use &quot;Start new session&quot; after changing the amount
                or country.
            </p>
            <div>
                <button type="button" onClick={reloadDropin}>
                    Reload Drop-in
                </button>
                <button type="button" onClick={startNewSession}>
                    Start new session
                </button>
            </div>
            <dl>
                <dt>Session</dt>
                <dd data-testid="session-origin">{sessionOrigin ?? 'loading...'}</dd>
                <dt>Persisted session id</dt>
                <dd data-testid="persisted-session-id">{persistedSessionId ?? 'none'}</dd>
            </dl>
            {errorMessage && <div role="alert">{errorMessage}</div>}
            <div ref={containerRef} id="component-root" className="component-wrapper" />
        </div>
    );
};
