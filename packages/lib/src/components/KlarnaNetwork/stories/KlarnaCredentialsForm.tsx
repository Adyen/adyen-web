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

const FIELDS: ReadonlyArray<{ key: keyof KlarnaCredentials; label: string }> = [
    { key: 'clientId', label: 'Client id (required)' },
    { key: 'paymentAccountId', label: 'Payment account id (required)' },
    { key: 'partnerAccountId', label: 'Partner account id (required)' }
];

interface KlarnaCredentialsFormProps {
    onApply(credentials: KlarnaCredentials): void;
}

function KlarnaCredentialsForm({ onApply }: Readonly<KlarnaCredentialsFormProps>) {
    const [draft, setDraft] = useState<KlarnaCredentials>(EMPTY_KLARNA_CREDENTIALS);

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

            <button type="submit" disabled={!draft.clientId || !draft.paymentAccountId}>
                Initialise Klarna
            </button>
        </form>
    );
}

export interface KlarnaCredentialsGateProps {
    children(credentials: KlarnaCredentials): ComponentChildren;
}

export function KlarnaCredentialsGate({ children }: Readonly<KlarnaCredentialsGateProps>) {
    const [applied, setApplied] = useState<KlarnaCredentials | null>(null);

    const handleApply = useCallback((credentials: KlarnaCredentials) => setApplied(credentials), []);

    return (
        <Fragment>
            <KlarnaCredentialsForm onApply={handleApply} />
            {applied ? children(applied) : <span>Enter a client id and payment account id above to initialise the Klarna Web SDK.</span>}
        </Fragment>
    );
}
