import { h } from 'preact';
import { useState } from 'preact/hooks';
import { SUPPORTED_PAYMENT_METHODS } from '../constants';
import type EMI from '../EMI';

interface EmiResolvedConfigProps {
    emi: EMI;
}

const panelStyle = { fontSize: '12px', color: '#666', marginTop: '16px', fontFamily: 'monospace' };
const dumpStyle = { background: '#f5f5f5', padding: '8px', margin: 0, overflowX: 'auto' as const };

const describe = (value?: string | string[]): string => {
    if (value === undefined) return 'Not specified';
    return Array.isArray(value) ? value.join(', ') : value;
};

/**
 * Storybook-only, read-only: reports what EMI resolved out of the `/paymentMethods` response and the
 * merchant configuration, so a split funding source setup can be inspected without a debugger.
 */
export function EmiResolvedConfig({ emi }: Readonly<EmiResolvedConfigProps>) {
    const [dumpedAt, setDumpedAt] = useState(0);

    const supportedPaymentMethods = emi.props.supportedPaymentMethods ?? [];
    // The lookup EMI itself does, so the panel names the entry the component is actually driven by
    const matched = supportedPaymentMethods.find(method => SUPPORTED_PAYMENT_METHODS[method.type] !== undefined);
    const card = emi.card;

    return (
        <div style={panelStyle}>
            <div>supportedPaymentMethods: {supportedPaymentMethods.length === 0 ? 'Not specified' : JSON.stringify(supportedPaymentMethods)}</div>
            <div>matched entry: {matched ? `${matched.type} / ${describe(matched.fundingSource)}` : 'None'}</div>
            <div>emi.card.props.fundingSource: {describe(card?.props.fundingSource)}</div>
            <div>emi.card.props.brands: {describe(card?.props.brands)}</div>
            <button type={'button'} onClick={() => setDumpedAt(Date.now())}>
                Dump formatData()
            </button>
            {dumpedAt > 0 && <pre style={dumpStyle}>{JSON.stringify(emi.formatData(), null, 2)}</pre>}
        </div>
    );
}
