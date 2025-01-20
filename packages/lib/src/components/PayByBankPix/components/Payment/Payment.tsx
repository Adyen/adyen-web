import { h } from 'preact';
import { useState } from 'preact/hooks';

function Payment({ showPayButton, payButton, storedPaymentMethodId }) {
    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;

    this.showValidation = () => {};

    const buttonModifiers = ['standalone'];

    return (
        <div>
            {
                // todo: if there is a storedPaymentId id show stored pm (click pay should just trigger biometrics)
            }
            {showPayButton &&
                payButton({
                    status,
                    label: 'Dummy',
                    classNameModifiers: buttonModifiers
                })}
        </div>
    );
}

export default Payment;
