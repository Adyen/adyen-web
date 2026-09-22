import { h } from 'preact';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';

import type { PayPalPayLaterConfiguration, SupportedPayPalFundingSources } from './types';

import { BasePayPalElement } from './models/BasePayPalElement';
import { PayPalPaylaterComponent } from './components/PayPalPaylaterComponent';
import { PayPalComponents } from './paypal-js-types';

class PayPalPaylaterElement extends BasePayPalElement<PayPalPayLaterConfiguration> {
    public static readonly type = TxVariants.paypal_paylater;

    protected override fundingSource: SupportedPayPalFundingSources = 'paylater';

    protected formatData() {
        const { isExpress } = this.props;

        return {
            paymentMethod: {
                type: this.type,
                subtype: isExpress ? 'express' : PayPalPaylaterElement.subtype
            },
            browserInfo: this.browserInfo
        };
    }

    public override get icon(): string {
        return this.resources.getImage()(TxVariants.paypal);
    }

    protected override get paypalComponents(): PayPalComponents {
        return ['paypal-payments', 'paypal-messages'];
    }

    protected override componentToRender(): h.JSX.Element | null {
        const { onShippingAddressChange, onShippingOptionsChange } = this.props;

        if (!this.paypalService) return null;

        return (
            <PayPalPaylaterComponent
                setComponentRef={this.setComponentRef}
                paypalService={this.paypalService}
                {...(onShippingAddressChange && { onShippingAddressChange: this.handleOnShippingAddressChange })}
                {...(onShippingOptionsChange && { onShippingOptionsChange: this.handleOnShippingOptionsChange })}
                commit={this.props.commit}
                presentationModeOptions={this.props.presentationModeOptions}
                hidePayPalMessaging={this.props.hidePayPalMessaging}
                messagingContentOptions={this.props.messagingContentOptions}
                countryCode={this.props.countryCode}
                onSubmit={this.handleSubmit}
                onApprove={this.handleOnApprove}
                onCancel={() => this.handleError(new AdyenCheckoutError('CANCEL'))}
                onError={error => this.handleError(new AdyenCheckoutError('ERROR', String(error), { cause: error }))}
            />
        );
    }
}

export default PayPalPaylaterElement;
