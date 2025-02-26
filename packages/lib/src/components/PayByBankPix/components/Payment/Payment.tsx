import { h } from 'preact';
import { useState } from 'preact/hooks';

function Payment({ payButton }) {
    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;
    const buttonModifiers = ['standalone'];

    return (
        <div>
            {
                // todo: add screen
            }
            {payButton({
                status,
                label: 'Dummy',
                classNameModifiers: buttonModifiers
            })}
        </div>
    );
}

export default Payment;
