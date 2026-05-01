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

type SessionSource = 'created' | 'reused-arg' | 'reused-url';

interface SessionDebugInfo {
    source: SessionSource;
    id: string;
    sessionDataOnInit: string | null;
    sessionDataAfterSetup: string | null;
    localStorageData: { id: string; sessionData: string } | null;
}

function readSessionFromLocalStorage(): { id: string; sessionData: string } | null {
    try {
        const raw = localStorage.getItem('adyen-checkout__session');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function truncate(value: string | null, len = 24): string {
    if (!value) return '—';
    return value.length > len ? `${value.slice(0, len)}…` : value;
}

const labelStyle: h.JSX.CSSProperties = { fontWeight: 'bold', minWidth: '180px', display: 'inline-block' };
const rowStyle: h.JSX.CSSProperties = { marginBottom: '4px', fontFamily: 'monospace', fontSize: '12px' };
const panelStyle: h.JSX.CSSProperties = {
    background: '#f4f4f4',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '12px 16px',
    maxWidth: '600px',
    margin: '0 auto 16px'
};

const sourceColors: Record<SessionSource, string> = {
    created: '#d4edda',
    'reused-arg': '#cce5ff',
    'reused-url': '#fff3cd'
};

const sourceLabels: Record<SessionSource, string> = {
    created: '🆕 Created (new session)',
    'reused-arg': '♻️ Reused (from Storybook arg)',
    'reused-url': '♻️ Reused (from URL ?sessionId=)'
};

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
    const [debugInfo, setDebugInfo] = useState<SessionDebugInfo | null>(null);

    const initCheckout = async () => {
        try {
            let session: { id: string; sessionData: string };
            let source: SessionSource;

            const existingSessionId = resolveInitialSessionId(argSessionId);

            if (existingSessionId) {
                source = argSessionId ? 'reused-arg' : 'reused-url';
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

                source = 'created';
                session = { id: created.id, sessionData: created.sessionData };

                persistSessionId(created.id);
                onSessionCreated?.(created.id);
            }

            const sessionDataOnInit = session.sessionData ?? readSessionFromLocalStorage()?.sessionData ?? null;

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

            setDebugInfo({
                source,
                id: checkout.session.id,
                sessionDataOnInit,
                sessionDataAfterSetup: checkout.session.data,
                localStorageData: readSessionFromLocalStorage()
            });

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

        return () => {
            checkoutRef.current = null;
            mountedRef.current = false;
        };
    }, []);

    return (
        <Fragment>
            {status === 'loading' && <div>Loading session...</div>}
            {status === 'error' && <div style={{ color: 'red' }}>Error: {errorMessage}</div>}
            {debugInfo && (
                <div style={{ ...panelStyle, background: sourceColors[debugInfo.source] }}>
                    <div style={rowStyle}><span style={labelStyle}>Session source:</span> {sourceLabels[debugInfo.source]}</div>
                    <div style={rowStyle}><span style={labelStyle}>Session ID:</span> {debugInfo.id}</div>
                    <div style={rowStyle}><span style={labelStyle}>sessionData on init:</span> {truncate(debugInfo.sessionDataOnInit)}</div>
                    <div style={rowStyle}><span style={labelStyle}>sessionData after /setup:</span> {truncate(debugInfo.sessionDataAfterSetup)}</div>
                    <div style={rowStyle}><span style={labelStyle}>localStorage id:</span> {debugInfo.localStorageData?.id ?? '—'}</div>
                    <div style={rowStyle}><span style={labelStyle}>localStorage sessionData:</span> {truncate(debugInfo.localStorageData?.sessionData)}</div>
                </div>
            )}
            <div id="dropin-giftcard-container" style={{ maxWidth: '600px', margin: '0 auto' }} />
        </Fragment>
    );
};

export { DropinGiftcardDemo };
