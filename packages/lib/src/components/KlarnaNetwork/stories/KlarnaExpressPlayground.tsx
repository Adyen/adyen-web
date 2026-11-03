import { h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { mapShippingUpdateToKlarna } from '../utils/klarna-mappers';
import { EXPRESS_CURRENCY, createMerchantCallbacks } from './klarna-express-stories-utils';

import type { KlarnaExpressLog } from './klarna-express-stories-utils';
import type { KlarnaNetworkShippingActions, KlarnaNetworkShippingUpdate } from '../types';
import type KlarnaNetwork from '../KlarnaNetwork';

interface LogEntry {
    id: number;
    time: string;
    step: string;
    payload?: unknown;
}

let nextLogId = 0;

export function useKlarnaExpressLog(): { entries: LogEntry[]; log: KlarnaExpressLog; clear(): void } {
    const [entries, setEntries] = useState<LogEntry[]>([]);

    const log = useCallback<KlarnaExpressLog>((step, payload) => {
        const entry = { id: nextLogId++, time: new Date().toISOString().slice(11, 23), step, payload };
        console.info('[KlarnaExpress]', step, payload);
        setEntries(current => [...current, entry]);
    }, []);

    const clear = useCallback(() => setEntries([]), []);

    return { entries, log, clear };
}

type MerchantCallbacks = ReturnType<typeof createMerchantCallbacks>;
type ShippingActions = KlarnaNetworkShippingActions<KlarnaNetworkShippingUpdate>;

// Previews call the demo callbacks outside a mounted component; they never read it
const NO_COMPONENT = null as unknown as KlarnaNetwork;

const PREVIEWS: ReadonlyArray<{ title: string; run(callbacks: MerchantCallbacks, actions: ShippingActions): void }> = [
    {
        title: 'Address: US',
        run: (callbacks, actions) =>
            callbacks.onShippingAddressChange(
                { shippingAddress: { street: '1 Main St', city: 'New York', postalCode: '10001', country: 'US' } },
                actions,
                NO_COMPONENT
            )
    },
    {
        title: 'Address: CA (reject)',
        run: (callbacks, actions) =>
            callbacks.onShippingAddressChange(
                { shippingAddress: { street: '1 Queen St', city: 'Toronto', postalCode: 'M5H 2N2', country: 'CA' } },
                actions,
                NO_COMPONENT
            )
    },
    {
        title: 'Select Express',
        run: (callbacks, actions) =>
            callbacks.onShippingOptionSelected(
                {
                    selectedDeliveryMethod: {
                        reference: 'express',
                        description: 'Express Shipping',
                        amount: { value: 1599, currency: EXPRESS_CURRENCY }
                    }
                },
                actions,
                NO_COMPONENT
            )
    },
    {
        title: 'Select Teleport (reject)',
        run: (callbacks, actions) =>
            callbacks.onShippingOptionSelected(
                {
                    selectedDeliveryMethod: {
                        reference: 'teleport',
                        description: 'Teleport Shipping Ultra fast',
                        amount: { value: 5000, currency: EXPRESS_CURRENCY }
                    }
                },
                actions,
                NO_COMPONENT
            )
    }
];

interface Preview {
    title: string;
    adyen: unknown;
    klarna: unknown;
}

const preStyle = { margin: 0, padding: '8px', background: '#f5f5f5', fontSize: '11px', overflow: 'auto', maxHeight: '320px' };

interface KlarnaExpressPlaygroundProps {
    entries: LogEntry[];
    onClear(): void;
}

export function KlarnaExpressPlayground({ entries, onClear }: Readonly<KlarnaExpressPlaygroundProps>) {
    const [preview, setPreview] = useState<Preview | null>(null);

    const runPreview = useCallback(({ title, run }: (typeof PREVIEWS)[number]) => {
        const callbacks = createMerchantCallbacks(() => {});

        run(callbacks, {
            resolve: update => setPreview({ title, adyen: update, klarna: mapShippingUpdateToKlarna(update) }),
            reject: reason => setPreview({ title, adyen: { rejected: reason }, klarna: { rejectionReason: reason } })
        });
    }, []);

    return (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px', fontSize: '13px' }}>
            <strong>Mapping preview (mock data, does not drive the component)</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PREVIEWS.map(item => (
                    <button key={item.title} type="button" onClick={() => runPreview(item)}>
                        {item.title}
                    </button>
                ))}
            </div>

            {preview && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <span>{preview.title}: merchant callback (Adyen format)</span>
                        <pre style={preStyle}>{JSON.stringify(preview.adyen, null, 2)}</pre>
                    </div>
                    <div>
                        <span>Sent to Klarna</span>
                        <pre style={preStyle}>{JSON.stringify(preview.klarna, null, 2)}</pre>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Event log</strong>
                <button type="button" onClick={onClear}>
                    Clear
                </button>
            </div>
            <pre style={preStyle} data-testid="klarna-express-log">
                {entries.length === 0
                    ? 'No events yet.'
                    : entries.map(entry => `${entry.time}  ${entry.step}\n${JSON.stringify(entry.payload, null, 2) ?? ''}\n`).join('\n')}
            </pre>
        </div>
    );
}
