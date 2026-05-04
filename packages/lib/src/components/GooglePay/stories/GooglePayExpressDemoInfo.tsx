import { h } from 'preact';

export function InfoBox() {
    return (
        <div
            style={{
                padding: '12px 16px',
                marginBottom: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                fontSize: '14px'
            }}
        >
            <strong>Google Pay Express on Sessions Flow</strong>
            <br />
            <strong>About this story:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                <li>
                    Country code is <code>BR</code> and currency is <code>BRL</code>.
                </li>
                <li>Initial amount is 100.00; shipping costs are added on top.</li>
                <li>Ships only to Brazil and the United States.</li>
                <li>Shipping options differ based on the selected country.</li>
            </ul>
        </div>
    );
}
