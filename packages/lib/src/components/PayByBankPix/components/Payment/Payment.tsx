import { h } from 'preact';
import { useState } from 'preact/hooks';

function Payment({ payButton }) {
    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;

    this.showValidation = () => {};

    const buttonModifiers = ['standalone'];

    return (
        <div>
            {
                // todo: if there is a storedPaymentId id show stored pm (click pay should just trigger biometrics)
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
