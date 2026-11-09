import { h } from 'preact';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';

import type { SupportedPayPalFundingSources, VenmoConfiguration } from './types';

import { BasePayPalElement } from './models/BasePayPalElement';
import { VenmoComponent } from './components/VenmoComponent';
import { PayPalComponents } from './paypal-js-types';

class VenmoElement extends BasePayPalElement<VenmoConfiguration> {
    public static readonly type = TxVariants.venmo;

    protected override fundingSource: SupportedPayPalFundingSources = 'venmo';

    protected override get paypalComponents(): PayPalComponents {
        return ['venmo-payments'];
    }

    protected override componentToRender(): h.JSX.Element | null {
        if (!this.paypalService) return null;

        return (
            <VenmoComponent
                setComponentRef={this.setComponentRef}
                paypalService={this.paypalService}
                commit={this.props.commit}
                vault={this.props.vault}
                presentationModeOptions={this.props.presentationModeOptions}
                environment={this.props.environment}
                onSubmit={this.handleSubmit}
                onApprove={this.handleOnApprove}
                onCancel={() => this.handleError(new AdyenCheckoutError('CANCEL'))}
                onError={error => this.handleError(new AdyenCheckoutError('ERROR', String(error), { cause: error }))}
            />
        );
    }
}

export default VenmoElement;
