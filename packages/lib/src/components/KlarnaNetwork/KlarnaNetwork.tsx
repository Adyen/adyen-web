import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { TxVariants } from '../tx-variants';
import { KlarnaNetworkContainer } from './components/KlarnaNetworkContainer/KlarnaNetworkContainer';

import type { RawPaymentResponse } from '../../types/global-types';
import type { KlarnaNetworkConfiguration } from './types';
import type { KlarnaInitiateParams, KlarnaInitiateResult, KlarnaPaymentError } from './klarna-web-sdk-types';

class KlarnaNetwork extends UIElement<KlarnaNetworkConfiguration> {
    public static readonly type = TxVariants.klarna_network;

    private klarnaNetworkSessionToken?: string;

    public override get isValid(): boolean {
        return true;
    }

    public override get displayName(): string {
        const name = super.displayName;
        return name === (KlarnaNetwork.type as string) ? 'Klarna' : name;
    }

    protected formatData() {
        return {
            paymentMethod: {
                type: KlarnaNetwork.type,
                klarnaNetworkSessionToken: this.klarnaNetworkSessionToken,
                klarnaNetworkPaymentAccountId: this.props.paymentAccountId
            }
        };
    }

    private readonly authorize = async ({ klarnaNetworkSessionToken }: KlarnaInitiateParams): Promise<KlarnaInitiateResult> => {
        this.klarnaNetworkSessionToken = klarnaNetworkSessionToken;

        const response = (await this.makePaymentsCall()) as RawPaymentResponse;

        this.setElementStatus('ready');

        const paymentRequestUrl = response.action?.sdkData?.paymentRequestUrl ?? response.action?.url;

        return { paymentRequestUrl };
    };

    private readonly handleKlarnaComplete = (paymentRequest: unknown): void => {
        console.log('KlarnaNetwork: Klarna reported the payment request as complete', paymentRequest);
        this.setElementStatus('ready');
    };

    private readonly handleKlarnaError = (error: KlarnaPaymentError | Error, paymentRequest?: unknown): void => {
        const { errorCode, errorMessage } = error as KlarnaPaymentError;
        console.error('Adyen Web Catch wrapper for Klarna SDK error', { errorCode, errorMessage, error, paymentRequest });
        this.setElementStatus('ready');
    };

    protected override componentToRender(): h.JSX.Element {
        return (
            <KlarnaNetworkContainer
                {...this.props}
                onAuthorize={this.authorize}
                onError={this.handleError}
                onKlarnaComplete={this.handleKlarnaComplete}
                onKlarnaError={this.handleKlarnaError}
            />
        );
    }
}

export default KlarnaNetwork;
