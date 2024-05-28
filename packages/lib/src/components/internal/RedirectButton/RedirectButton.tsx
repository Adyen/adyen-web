import { h, Fragment } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useState } from 'preact/hooks';

function RedirectButton({ label = null, icon = null, payButton, onSubmit, amount = null, name, ...props }) {
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

    if (!props.showPayButton) {
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
