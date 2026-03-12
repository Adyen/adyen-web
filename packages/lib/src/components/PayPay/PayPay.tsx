import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PayPaySdkLoader from './services/PayPaySdkLoader';
import { TxVariants } from '../tx-variants';
import Button from '../internal/Button';
import PayPayService from './services/PayPayService';

import type { PayPayConfiguration } from './types';
import type { ICore } from '../../core/types';

class PayPayElement extends UIElement<PayPayConfiguration> {
    public static readonly type = TxVariants.paypay;

    protected static readonly defaultProps: PayPayConfiguration = {
        type: PayPayElement.type,
        configuration: {
            clientId: ''
        }
    };

    private sdkLoader: PayPaySdkLoader;
    private paypayService: PayPayService;

    constructor(checkout: ICore, props?: PayPayConfiguration) {
        super(checkout, props);

        this.submit = this.submit.bind(this);

        this.sdkLoader = new PayPaySdkLoader({ analytics: this.analytics });

        this.paypayService = new PayPayService({
            clientId: this.props.configuration.clientId,
            environment: this.props.environment,
            sdkLoader: this.sdkLoader
        });

        void this.paypayService.initialize().catch(error => {
            this.handleError(error);
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
        return Promise.resolve();
    }

    public override submit = (): void => {
        // TODO: Implement PayPay payment flow
    };

    protected override componentToRender(): h.JSX.Element {
        if (!this.props.showPayButton) {
            return null;
        }

        return <Button label={'PayPay'} />;
    }
}

export default PayPayElement;
