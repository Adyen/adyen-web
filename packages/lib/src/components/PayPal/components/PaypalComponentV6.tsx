import { h } from 'preact';
import { PayPalComponentV6Props } from './types';
import { PayPalButton } from './PayPalButton';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import { PayPalCreditButton } from './PayPalCreditButton';
import { VenmoButton } from './VenmoButton';

const PayPalComponentV6 = ({
    paypalService,
    style,
    commit,
    vault,
    blockPayPalCreditButton,
    blockPayPalPayLaterButton,
    blockPayPalVenmoButton,
    onSubmit,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError
}: Readonly<PayPalComponentV6Props>) => {
    const commonProps = {
        paypalService,
        onSubmit,
        onApprove,
        onError,
        onShippingAddressChange,
        onShippingOptionsChange,
        onCancel,
        commit
    };

    return (
        <div className="adyen-checkout__paypal" data-testid="paypal-component">
            <PayPalButton {...commonProps} style={style.paypal} vault={vault} />
            {!blockPayPalPayLaterButton && <PayPalPayLaterButton {...commonProps} />}
            {!blockPayPalCreditButton && <PayPalCreditButton {...commonProps} vault={vault} />}
            {!blockPayPalVenmoButton && <VenmoButton {...commonProps} style={style.venmo} onCancel={onCancel} vault={vault} />}
        </div>
    );
};

export { PayPalComponentV6 };
