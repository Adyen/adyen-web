import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { TxVariants } from '../tx-variants';
import PayPaySdkLoader from './services/PayPaySdkLoader';
import PayPayService from './services/PayPayService';
import PayPayComponent from './components/PayPayComponent';

import type { PayPayConfiguration } from './types';
import type { ICore } from '../../core/types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

class PayPayElement extends UIElement<PayPayConfiguration> {
    public static readonly type = TxVariants.paypay;

    protected static readonly defaultProps: PayPayConfiguration = {
        type: PayPayElement.type,
        configuration: {
            clientId: '',
            merchantId: ''
        }
    };

    private readonly sdkLoader: PayPaySdkLoader;
    private readonly paypayService: PayPayService;

    constructor(checkout: ICore, props?: PayPayConfiguration) {
        super(checkout, props);

        this.submit = this.submit.bind(this);

        this.sdkLoader = new PayPaySdkLoader({ analytics: this.analytics });
        void this.sdkLoader.load();

        this.paypayService = new PayPayService({
            clientId: this.props.configuration.clientId,
            merchantId: this.props.configuration.merchantId,
            environment: this.props.environment
        });
    }

    public override formatData() {
        return {
            paymentMethod: {
                type: this.type
            }
        };
    }

    public override get isValid(): boolean {
        return true;
    }

    public override async isAvailable(): Promise<void> {
        try {
            await this.sdkLoader.isSdkLoaded();
            return Promise.resolve();
        } catch (error: unknown) {
            return Promise.reject(new AdyenCheckoutError('ERROR', 'PayPay SDK failed to load', { cause: error }));
        }
    }

    public override submit = (): void => {
        // TODO: Implement PayPay payment flow
    };

    protected override componentToRender(): h.JSX.Element {
        if (!this.props.showPayButton) {
            return null;
        }

        return <PayPayComponent service={this.paypayService} />;
    }
}

export default PayPayElement;
