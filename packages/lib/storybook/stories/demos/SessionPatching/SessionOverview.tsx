import { h } from 'preact';

function SessionOverview({ sessionId, sessionData }) {
    return (
        <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <div style={{ padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', border: '1px solid #ced4da' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                    Current Session ID:
                    <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>{sessionId || 'N/A'}</code>
                </p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                    Session Data (Last 50 Chars):
                    <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px', wordBreak: 'break-all' }}>
                        ...${sessionData.slice(-50)}
                    </code>
                </p>
            </div>
        </div>
    );
}

export { SessionOverview };
