import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import type { ComponentChildren } from 'preact';

export interface KlarnaCredentials {
    clientId: string;
    paymentAccountId: string;
    partnerAccountId: string;
}

const EMPTY_KLARNA_CREDENTIALS: KlarnaCredentials = {
    clientId: '',
    paymentAccountId: '',
    partnerAccountId: ''
};

/**
 * Values are injected by .storybook/main.ts in dev mode only, and are empty strings in static builds.
 */
export function getKlarnaEnvCredentials(): KlarnaCredentials | null {
    const clientId = process.env.KLARNA_CLIENT_ID ?? '';
    const paymentAccountId = process.env.KLARNA_PAYMENT_ACCOUNT_ID ?? '';
    const partnerAccountId = process.env.KLARNA_PARTNER_ID ?? '';

    if (!clientId || !paymentAccountId || !partnerAccountId) return null;

    return { clientId, paymentAccountId, partnerAccountId };
}

const FIELDS: ReadonlyArray<{ key: keyof KlarnaCredentials; label: string }> = [
    { key: 'clientId', label: 'Client id (required)' },
    { key: 'paymentAccountId', label: 'Payment account id (required)' },
    { key: 'partnerAccountId', label: 'Partner account id (required)' }
];

interface KlarnaCredentialsFormProps {
    initialCredentials: KlarnaCredentials | null;
    onApply(credentials: KlarnaCredentials): void;
}

function KlarnaCredentialsForm({ initialCredentials, onApply }: Readonly<KlarnaCredentialsFormProps>) {
    const [draft, setDraft] = useState<KlarnaCredentials>(initialCredentials ?? EMPTY_KLARNA_CREDENTIALS);

    const handleSubmit = useCallback(
        (event: Event) => {
            event.preventDefault();
            onApply({ ...draft });
        },
        [draft, onApply]
    );

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginBottom: '24px', maxWidth: '540px', fontSize: '13px' }}>
            <strong>Klarna credentials</strong>
            {initialCredentials && <span>Loaded from .env (dev only)</span>}
            {FIELDS.map(({ key, label }) => (
                <label key={key} style={{ display: 'grid', gap: '4px' }}>
                    <span>{label}</span>
                    <input
                        type="password"
                        value={draft[key]}
                        autoComplete="off"
                        onInput={event => setDraft(current => ({ ...current, [key]: (event.target as HTMLInputElement).value }))}
                        style={{ padding: '6px 8px', font: 'inherit' }}
                    />
                </label>
            ))}

            <button type="submit" disabled={!draft.clientId || !draft.paymentAccountId || !draft.partnerAccountId}>
                Initialise Klarna
            </button>
        </form>
    );
}

export interface KlarnaCredentialsGateProps {
    children(credentials: KlarnaCredentials): ComponentChildren;
}

export function KlarnaCredentialsGate({ children }: Readonly<KlarnaCredentialsGateProps>) {
    const [envCredentials] = useState(getKlarnaEnvCredentials);
    const [applied, setApplied] = useState<KlarnaCredentials | null>(envCredentials);

    const handleApply = useCallback((credentials: KlarnaCredentials) => setApplied(credentials), []);

    return (
        <Fragment>
            <KlarnaCredentialsForm initialCredentials={envCredentials} onApply={handleApply} />
            {applied ? (
                children(applied)
            ) : (
                <span>Enter a client id, payment account id and partner account id above to initialise the Klarna Web SDK.</span>
            )}
        </Fragment>
    );
}
