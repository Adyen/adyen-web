import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';
import { KlarnaNetworkContainer } from './components/KlarnaNetworkContainer/KlarnaNetworkContainer';

import type { RawPaymentResponse } from '../../types/global-types';
import type { KlarnaNetworkConfiguration } from './types';
import type { KlarnaInitiateParams, PresentationInitiateResult } from './klarna-web-sdk-types';

const MISSING_PAYMENT_ACCOUNT_ID =
    "KlarnaNetwork: 'paymentAccountId' is required. /payments rejects the payment without " + "'klarnaNetworkPaymentAccountId'.";

const NO_PAYMENT_REQUEST =
    'KlarnaNetwork: /payments returned no Klarna payment request. Klarna only creates one when ' +
    "authorize is called with step_up_config.method = 'SDK', which Adyen does not send yet. " +
    'See KlarnaNetwork.md.';

const getSdkHandover = (response: RawPaymentResponse): PresentationInitiateResult | undefined => {
    const sdkData = response.action?.type === 'sdk' ? response.action.sdkData : undefined;

    if (sdkData?.paymentRequestUrl) return { paymentRequestUrl: sdkData.paymentRequestUrl };
    if (sdkData?.paymentRequestId) return { paymentRequestId: sdkData.paymentRequestId };
    return undefined;
};

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

    private readonly authorize = async ({ klarnaNetworkSessionToken }: KlarnaInitiateParams): Promise<PresentationInitiateResult> => {
        this.klarnaNetworkSessionToken = klarnaNetworkSessionToken;

        try {
            if (!this.props.paymentAccountId) {
                throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', MISSING_PAYMENT_ACCOUNT_ID);
            }

            const response = (await this.makePaymentsCall()) as RawPaymentResponse;

            this.setElementStatus('ready');

            const handover = getSdkHandover(response);

            if (!handover) {
                console.error('KlarnaNetwork: raw /payments response', response);
                throw new AdyenCheckoutError('ERROR', NO_PAYMENT_REQUEST);
            }

            return handover;
        } catch (error: unknown) {
            this.handleError(
                error instanceof AdyenCheckoutError
                    ? error
                    : new AdyenCheckoutError('ERROR', 'KlarnaNetwork: the payment authorization failed', { cause: error })
            );
            throw error;
        }
    };

    private readonly handleKlarnaComplete = (paymentRequest: unknown): void => {
        console.log('KlarnaNetwork: Klarna reported the payment request as complete', paymentRequest);
        this.setElementStatus('ready');
    };

    protected override componentToRender(): h.JSX.Element {
        return (
            <KlarnaNetworkContainer
                {...this.props}
                onAuthorize={this.authorize}
                onError={this.handleError}
                onKlarnaComplete={this.handleKlarnaComplete}
            />
        );
    }
}

export default KlarnaNetwork;
