import { h } from 'preact';
import { PayPalComponentV6Props } from './types';
import { PayPalButton } from './PayPalButton';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import { PayPalCreditButton } from './PayPalCreditButton';
import { VenmoButton } from './VenmoButton';

const PayPalComponentV6 = ({
    paypalService,
    onSubmit,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    style,
    commit,
    vault
}: Readonly<PayPalComponentV6Props>) => {
    const commonProps = {
        paypalService,
        onSubmit,
        onApprove,
        onError,
        onShippingAddressChange,
        onShippingOptionsChange,
        onCancel
    };

    return (
        <div className="adyen-checkout__paypal" data-testid="paypal-component">
            <PayPalButton {...commonProps} style={style.paypal} commit={commit} vault={vault} />
            <PayPalPayLaterButton
                {...commonProps}
                commit={commit}
                onShippingAddressChange={onShippingAddressChange}
                onShippingOptionsChange={onShippingOptionsChange}
                onCancel={onCancel}
            />
            <PayPalCreditButton
                {...commonProps}
                onShippingAddressChange={onShippingAddressChange}
                onShippingOptionsChange={onShippingOptionsChange}
                onCancel={onCancel}
                commit={commit}
                vault={vault}
            />
            <VenmoButton {...commonProps} style={style.venmo} onCancel={onCancel} commit={commit} />
        </div>
    );
};

export { PayPalComponentV6 };
