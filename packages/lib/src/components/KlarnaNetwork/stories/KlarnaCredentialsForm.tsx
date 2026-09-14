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
    { key: 'paymentAccountId', label: 'Payment account id (optional)' },
    { key: 'partnerAccountId', label: 'Partner account id (optional)' }
];

interface KlarnaCredentialsFormProps {
    onApply(credentials: KlarnaCredentials): void;
}

/**
 * Storybook-only credential entry. Deliberately not wired to Storybook `args`: Storybook mirrors
 * changed args into the URL, so a credential pasted into the controls panel would end up in the
 * address bar and in browser history. Nothing is seeded from the build either, so values typed here
 * have to be re-entered after every reload.
 *
 * The fields are always masked so a credential cannot leak into a screen share or screenshot.
 */
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

            <button type="submit" disabled={!draft.clientId}>
                Initialise Klarna
            </button>
        </form>
    );
}

export interface KlarnaCredentialsGateProps {
    children(credentials: KlarnaCredentials): ComponentChildren;
}

/**
 * Renders the credential form and only builds the Klarna element once a client id has been applied.
 *
 * The draft values live inside {@link KlarnaCredentialsForm}, so typing does not re-render this
 * component and the element is rebuilt only when 'Initialise Klarna' is pressed.
 */
export function KlarnaCredentialsGate({ children }: Readonly<KlarnaCredentialsGateProps>) {
    const [applied, setApplied] = useState<KlarnaCredentials | null>(null);

    const handleApply = useCallback((credentials: KlarnaCredentials) => setApplied(credentials), []);

    return (
        <Fragment>
            <KlarnaCredentialsForm onApply={handleApply} />
            {applied ? children(applied) : <span>Enter a client id above to initialise the Klarna Web SDK.</span>}
        </Fragment>
    );
}
