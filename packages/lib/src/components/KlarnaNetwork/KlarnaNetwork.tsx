import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { sanitizeResponse } from '../internal/UIElement/utils';
import { TxVariants } from '../tx-variants';
import { KlarnaNetworkContainer } from './components/KlarnaNetworkContainer/KlarnaNetworkContainer';

import type { RawPaymentResponse } from '../../types/global-types';
import type { KlarnaNetworkConfiguration } from './types';
import type { KlarnaInitiateParams, PresentationInitiateResult } from './klarna-web-sdk-types';

/**
 * Proof of concept component for Klarna's Network Distribution Web SDK.
 */
class KlarnaNetwork extends UIElement<KlarnaNetworkConfiguration> {
    public static readonly type = TxVariants.klarna_network;

    private klarnaNetworkSessionToken?: string;
    private paymentOptionId?: string;

    /**
     * Drop-in validation: Klarna Network collects no shopper input.
     */
    public override get isValid(): boolean {
        return true;
    }

    /**
     * 'klarna_network' is a synthetic tx variant with no icon asset of its own, so the regular
     * 'klarna' logo is served.
     */
    public override get icon(): string {
        return this.props.icon ?? this.resources.getImage()(TxVariants.klarna);
    }

    /**
     * `props.name` and the /paymentMethods name win, as they do for every other element. Only the
     * base fallback is replaced: it is the tx variant, which would surface as 'klarna_network'.
     */
    public override get displayName(): string {
        const name = super.displayName;
        return name === (KlarnaNetwork.type as string) ? 'Klarna' : name;
    }

    protected formatData() {
        return {
            paymentMethod: {
                type: KlarnaNetwork.type,
                klarnaNetworkSessionToken: this.klarnaNetworkSessionToken,
                paymentOptionId: this.paymentOptionId
            }
        };
    }

    /**
     * Passed to the Klarna SDK as its `initiate` callback. Klarna invokes it with the session token
     * and expects either a payment request URL to continue from, or an empty object.
     */
    private readonly authorize = async ({
        klarnaNetworkSessionToken,
        paymentOptionId
    }: KlarnaInitiateParams): Promise<PresentationInitiateResult> => {
        this.klarnaNetworkSessionToken = klarnaNetworkSessionToken;
        this.paymentOptionId = paymentOptionId;

        try {
            const response = (await this.makePaymentsCall()) as RawPaymentResponse;
            const action = response.action;

            // A Klarna Network step-up arrives as a regular Adyen redirect action. Klarna takes over
            // the journey once it is handed the URL, so the action is not passed to handleAction.
            if (action?.type === 'redirect' && action.url) {
                // Klarna launches the step-up journey itself, so the element goes back to 'ready'
                // instead of leaving a spinner behind the Klarna overlay.
                this.setElementStatus('ready');
                return { paymentRequestUrl: action.url };
            }

            this.handleResponse(sanitizeResponse(response));
            return {};
        } catch (error: unknown) {
            this.handleError(new AdyenCheckoutError('ERROR', 'KlarnaNetwork: the payment authorization failed', { cause: error }));
            // Rethrown so Klarna surfaces the failure in its own UI.
            throw error;
        }
    };

    /** Klarna finished the payment request on the page, without redirecting the shopper away. */
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
