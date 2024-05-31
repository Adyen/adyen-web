import { h, Fragment } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useState } from 'preact/hooks';
import { PaymentAmount } from '../../../types';

// TODO this should ideally be remove but we need let prop propagate down
//  probably not worth changing this behaviour now
export interface RedirectButtonProps {
    label?: string;
    icon?: string;
    payButton: Function;
    onSubmit: Function;
    amount?: PaymentAmount;
    name: string;
    showPayButton: boolean;
    ref?: any;
}

function RedirectButton({ label = null, icon = null, payButton, onSubmit, amount = null, name, showPayButton, ...props }: RedirectButtonProps) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    const payButtonLabel = () => {
        const isZeroAuth = amount && {}.hasOwnProperty.call(amount, 'value') && amount.value === 0;
        if (isZeroAuth) return `${i18n.get('preauthorizeWith')} ${name}`;
        return `${i18n.get('continueTo')} ${name}`;
    };

    if (!showPayButton) {
        return;
    }

    return (
        <Fragment>
            {payButton({
                ...props,
                status,
                icon,
                classNameModifiers: ['standalone'],
                label: label || payButtonLabel(),
                onClick: onSubmit
            })}
        </Fragment>
    );
}

export default RedirectButton;
