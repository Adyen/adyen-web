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

const STORAGE_KEY = 'adyen-web-storybook:giftcard-reload-session';

interface PersistedSession {
    id: string;
    sessionData: string;
    countryCode: string;
    amount: number;
}

interface GiftcardReloadDemoProps {
    amount: number;
    countryCode: string;
    shopperLocale: string;
}

const isPersistedSession = (value: unknown): value is PersistedSession => {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.id === 'string' &&
        typeof candidate.sessionData === 'string' &&
        typeof candidate.countryCode === 'string' &&
        typeof candidate.amount === 'number'
    );
};

const readPersistedSession = (): PersistedSession | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed: unknown = JSON.parse(raw);
        return isPersistedSession(parsed) ? parsed : null;
    } catch (error: unknown) {
        console.warn('GiftcardReload: could not parse the persisted session', error);
        return null;
    }
};

const writePersistedSession = (session: PersistedSession): void => localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

const clearPersistedSession = (): void => localStorage.removeItem(STORAGE_KEY);

/**
 * Simulates a merchant that persists the latest `sessionData` (received in `onOrderUpdated`) and passes it
 * back when the checkout is initialised again, instead of creating a new session on every page load.
 */
export const GiftcardReloadDemo = ({ amount, countryCode, shopperLocale }: Readonly<GiftcardReloadDemoProps>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [initializationKey, setInitializationKey] = useState(0);
    const [persisted, setPersisted] = useState<PersistedSession | null>(readPersistedSession);
    const [sessionOrigin, setSessionOrigin] = useState<'new' | 'restored' | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const persist = (session: PersistedSession): void => {
        writePersistedSession(session);
        setPersisted(session);
    };

    const discardPersisted = (): void => {
        clearPersistedSession();
        setPersisted(null);
    };

    useEffect(() => {
        let dropin: InstanceType<typeof DropinComponent> | undefined;
        let cancelled = false;

        const init = async () => {
            setErrorMessage(null);
            setSessionOrigin(null);

            const stored = readPersistedSession();
            const canRestore = stored?.countryCode === countryCode && stored.amount === Number(amount);

            let session: PersistedSession;

            if (stored && canRestore) {
                session = stored;
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
                session = { id: response.id, sessionData: response.sessionData, countryCode, amount: Number(amount) };
                persist(session);
            }

            const checkout = await AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                environment: process.env.CLIENT_ENV as CoreConfiguration['environment'],
                countryCode,
                locale: shopperLocale,
                session: { id: session.id, sessionData: session.sessionData },
                onOrderUpdated: (data: OrderUpdatedData) => {
                    console.log('onOrderUpdated', data);

                    if (!data.sessionData) {
                        console.warn('GiftcardReload: onOrderUpdated did not return sessionData');
                        return;
                    }
                    persist({ ...session, sessionData: data.sessionData });
                },
                onPaymentCompleted: result => {
                    console.log('onPaymentCompleted', result);
                    discardPersisted();
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
            setSessionOrigin(stored && canRestore ? 'restored' : 'new');
        };

        init().catch((error: unknown) => {
            console.error('GiftcardReload: failed to initialise the checkout', error);
            if (cancelled) return;
            // A persisted session can expire. Drop it so the next attempt creates a fresh one
            discardPersisted();
            setErrorMessage('Could not initialise the checkout. The persisted session was cleared, use "Reload Drop-in" to start again.');
        });

        return () => {
            cancelled = true;
            dropin?.unmount();
        };
    }, [initializationKey, countryCode, amount, shopperLocale]);

    const reloadDropin = () => setInitializationKey(key => key + 1);

    const startNewSession = () => {
        discardPersisted();
        reloadDropin();
    };

    return (
        <div>
            <p>
                1. Pay with a gift card for less than the total. 2. Reload the page (or use &quot;Reload Drop-in&quot;). The Drop-in is initialised
                with the <code>sessionData</code> received in <code>onOrderUpdated</code>, and the applied gift card should be displayed.
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
                <dd data-testid="persisted-session-id">{persisted?.id ?? 'none'}</dd>
                <dt>Persisted sessionData (last 16 chars)</dt>
                <dd data-testid="persisted-session-data">{persisted ? `...${persisted.sessionData.slice(-16)}` : 'none'}</dd>
            </dl>
            {errorMessage && <div role="alert">{errorMessage}</div>}
            <div ref={containerRef} id="component-root" className="component-wrapper" />
        </div>
    );
};
