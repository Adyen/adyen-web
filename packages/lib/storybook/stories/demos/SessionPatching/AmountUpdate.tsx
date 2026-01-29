import { h } from 'preact';
import { useState } from 'preact/hooks';

function AmountUpdate({ onUpdateAmount }) {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const handleAmountChange = event => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        setAmount(value);
        setMessage('');
    };

    const handleDispatchRequest = () => {
        if (amount === '' || isNaN(parseFloat(amount))) {
            setMessage('⚠️ Please enter a valid number for the amount.');
            return;
        }

        onUpdateAmount(amount);
        setMessage('✅ Success!');
        setAmount('');
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #001222', borderRadius: '8px', backgroundColor: '#f8f9fa', display: 'flex' }}>
            <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter new amount"
                style={{
                    padding: '10px',
                    marginRight: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    width: '200px'
                }}
            />

            <button
                onClick={handleDispatchRequest}
                style={{
                    padding: '10px 15px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#001222',
                    color: 'white',
                    cursor: 'pointer'
                }}
            >
                Update amount
            </button>

            {message && (
                <div
                    style={{
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        marginLeft: '20px',
                        fontWeight: 'bold',
                        color: message.startsWith('✅') ? 'green' : message.startsWith('❌') ? 'red' : 'orange'
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
}

export { AmountUpdate };
