import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { TxVariants } from '../tx-variants';
import { KlarnaPresentationContainer } from './components/KlarnaPresentationContainer/KlarnaPresentationContainer';

import type { ICore } from '../../core/types';
import type { RawPaymentResponse } from '../../types/global-types';
import type { KlarnaNetworkAuthorizeResult, KlarnaNetworkConfiguration } from './types';
import type { KlarnaInitiateParams, KlarnaPaymentError } from './klarna-web-sdk-types';

/**
 * Regular checkout: the standalone component and Drop-in.
 * KlarnaNetworkExpress extends this class for Express Checkout.
 */
class KlarnaNetwork<P extends KlarnaNetworkConfiguration = KlarnaNetworkConfiguration> extends UIElement<P> {
    public static readonly type = TxVariants.klarna_network;

    private klarnaNetworkSessionToken?: string;

    // NoInfer keeps P on its default; otherwise `new KlarnaNetwork(checkout, credentials)` infers P from the argument
    // and the instance stops being assignable to UIElement<UIElementProps>.
    constructor(checkout: ICore, props?: NoInfer<P>) {
        super(checkout, props);
    }

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
                subtype: 'sdk',
                klarnaNetworkSessionToken: this.klarnaNetworkSessionToken,
                klarnaNetworkPaymentAccountId: this.props.paymentAccountId
            }
        };
    }

    protected readonly authorize = async ({ klarnaNetworkSessionToken }: KlarnaInitiateParams): Promise<KlarnaNetworkAuthorizeResult> => {
        this.klarnaNetworkSessionToken = klarnaNetworkSessionToken;

        const response = (await this.makePaymentsCall()) as RawPaymentResponse;

        this.setElementStatus('ready');

        const paymentRequestId = response.action?.sdkData?.paymentRequestId as string | undefined;

        return { paymentRequestId };
    };

    protected readonly handleKlarnaError = (error: KlarnaPaymentError | Error, paymentRequest?: unknown): void => {
        const { errorCode, errorMessage } = error as KlarnaPaymentError;
        console.error('Adyen Web Catch wrapper for Klarna SDK error', { errorCode, errorMessage, error, paymentRequest });
        this.setElementStatus('ready');
    };

    protected override componentToRender(): h.JSX.Element {
        const { clientId, partnerAccountId, paymentAccountId } = this.props;

        return (
            <KlarnaPresentationContainer
                clientId={clientId}
                partnerAccountId={partnerAccountId}
                paymentAccountId={paymentAccountId}
                onAuthorize={this.authorize}
                onError={this.handleError}
                onKlarnaError={this.handleKlarnaError}
            />
        );
    }
}

export default KlarnaNetwork;
