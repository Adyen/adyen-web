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

const FIELDS: ReadonlyArray<{ key: keyof KlarnaCredentials; label: string; hint: string }> = [
    { key: 'clientId', label: 'Client id', hint: 'Required.' },
    { key: 'paymentAccountId', label: 'Payment account id', hint: 'Optional.' },
    { key: 'partnerAccountId', label: 'Partner account id', hint: 'Optional.' }
];

export interface KlarnaCredentialsFormProps {
    onApply(credentials: KlarnaCredentials): void;
}

/**
 * Storybook-only credential entry.
 *
 * Deliberately not wired to Storybook `args`: Storybook mirrors changed args into the URL, so a
 * credential pasted into the controls panel would end up in the address bar, in browser history and
 * in any shared link or screenshot. Nothing is seeded from the build either, so values typed here
 * never leave this component's state and no credential is ever baked into a Storybook build.
 */
export function KlarnaCredentialsForm({ onApply }: Readonly<KlarnaCredentialsFormProps>) {
    const [draft, setDraft] = useState<KlarnaCredentials>(EMPTY_KLARNA_CREDENTIALS);
    const [isVisible, setIsVisible] = useState(false);

    const handleSubmit = useCallback(
        (event: Event) => {
            event.preventDefault();
            onApply({ ...draft });
        },
        [draft, onApply]
    );

    const handleClear = useCallback(() => {
        setDraft(EMPTY_KLARNA_CREDENTIALS);
        onApply({ ...EMPTY_KLARNA_CREDENTIALS });
    }, [onApply]);

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: 'grid', gap: '12px', marginBottom: '24px', maxWidth: '540px', fontFamily: 'sans-serif', fontSize: '13px' }}
        >
            <strong>Klarna credentials</strong>
            {FIELDS.map(({ key, label, hint }) => (
                <label key={key} style={{ display: 'grid', gap: '4px' }}>
                    <span>{label}</span>
                    <input
                        type={isVisible ? 'text' : 'password'}
                        value={draft[key]}
                        autoComplete="off"
                        onInput={event => setDraft(current => ({ ...current, [key]: (event.target as HTMLInputElement).value }))}
                        style={{ padding: '6px 8px', font: 'inherit' }}
                    />
                    <span style={{ color: '#5c687c' }}>{hint}</span>
                </label>
            ))}

            <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="checkbox" checked={isVisible} onChange={() => setIsVisible(visible => !visible)} />
                <span>Show values</span>
            </label>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" disabled={!draft.clientId}>
                    Initialise Klarna
                </button>
                <button type="button" onClick={handleClear}>
                    Clear
                </button>
            </div>
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

    const handleApply = useCallback((credentials: KlarnaCredentials) => {
        setApplied(credentials.clientId ? credentials : null);
    }, []);

    return (
        <Fragment>
            <KlarnaCredentialsForm onApply={handleApply} />
            {applied ? children(applied) : <span>Enter a client id above to initialise the Klarna Web SDK.</span>}
        </Fragment>
    );
}

export default KlarnaCredentialsForm;
