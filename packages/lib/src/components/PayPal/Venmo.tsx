import { h } from 'preact';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';

import type { SupportedPayPalFundingSources } from './types';

import { BasePaypalElement } from './models/BasePaypalElement';
import { VenmoComponent } from './components/VenmoComponent';
import type { VenmoConfiguration } from './types';
import { PayPalComponents } from './paypal-js-types';
import './Paypal.scss';

class VenmoElement extends BasePaypalElement<VenmoConfiguration> {
    public static readonly type = TxVariants.paypal_venmo;

    protected override fundingSource: SupportedPayPalFundingSources = 'venmo';
    protected override elementName: string = 'Venmo';

    protected override get paypalComponents(): PayPalComponents {
        return ['paypal-payments', 'venmo-payments'];
    }

    public override get icon(): string {
        return this.resources.getImage()('venmo');
    }

    protected override componentToRender(): h.JSX.Element | null {
        if (!this.props.showPayButton) return null;

        if (!this.paypalService) return null;

        return (
            <VenmoComponent
                setComponentRef={this.setComponentRef}
                paypalService={this.paypalService}
                commit={this.props.commit}
                vault={this.props.vault}
                presentationModeOptions={this.props.presentationModeOptions}
                countryCode={this.props.countryCode}
                onSubmit={this.handleSubmit}
                onApprove={this.handleOnApprove}
                onCancel={() => this.handleError(new AdyenCheckoutError('CANCEL'))}
                onError={error => this.handleError(new AdyenCheckoutError('ERROR', String(error), { cause: error }))}
            />
        );
    }
}

export default VenmoElement;
