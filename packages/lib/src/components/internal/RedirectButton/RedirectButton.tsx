import { h, Fragment } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useState } from 'preact/hooks';
import { PaymentAmount } from '../../../types/global-types';
import { PayButtonFunctionProps } from '../UIElement/types';

type RedirectButtonState = 'ready' | 'loading' | 'redirecting';

type RedirectButtonProps = {
    label: string;
    icon: string;
    name: string;
    isRedirecting: boolean;
    amount: PaymentAmount;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    onSubmit(): void;
};

function RedirectButton({ label = null, icon = null, payButton, onSubmit, amount = null, name, ...props }: RedirectButtonProps) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState<RedirectButtonState>('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    const payButtonLabel = () => {
        const isZeroAuth = amount && {}.hasOwnProperty.call(amount, 'value') && amount.value === 0;
        if (isZeroAuth) return `${i18n.get('preauthorizeWith')} ${name}`;
        return `${i18n.get('continueTo')} ${name}`;
    };

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
