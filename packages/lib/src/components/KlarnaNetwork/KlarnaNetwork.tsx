import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { sanitizeResponse } from '../internal/UIElement/utils';
import { TxVariants } from '../tx-variants';
import { KlarnaNetworkContainer } from './components/KlarnaNetworkContainer/KlarnaNetworkContainer';

import type { RawPaymentResponse } from '../../types/global-types';
import type { KlarnaAuthorizationFlow, KlarnaNetworkConfiguration } from './types';
import type { KlarnaInitiateParams, PresentationInitiateResult } from './klarna-web-sdk-types';

const SDK_FLOW_UNSUPPORTED =
    'KlarnaNetwork: /payments answered with the shipped redirect flow, which the Klarna Web SDK cannot consume. ' +
    "Adyen seals Klarna's payment request URL inside 'checkoutPaymentRedirect?redirectData=...', and the SDK needs it " +
    "unwrapped to read its region and access token. Use authorizationFlow 'redirect' until /payments supports this.";

/**
 * The URL the Klarna Web SDK needs to launch the purchase journey in context.
 *
 * A `redirect` action is deliberately not accepted: its URL is Adyen's `checkoutPaymentRedirect`
 * wrapper, and handing that to the SDK is what produces Klarna's "Well, this is awkward" page.
 */
const getPaymentRequestUrl = (response: RawPaymentResponse): string | undefined =>
    response.action?.type === 'sdk' ? response.action.sdkData?.paymentRequestUrl : undefined;

/**
 * Proof of concept component for Klarna's Network Distribution Web SDK.
 *
 * Klarna documents two ways to authorize a Network payment, and `klarna_network` is the single tx
 * variant behind both. {@link KlarnaAuthorizationFlow} selects which one this component drives.
 *
 * 'redirect' is Klarna's server-side model and is already live at Adyen: `/payments` makes the
 * `payment/authorize` call itself, Klarna answers `PENDING` with a `redirect_url`, and the shopper
 * is sent to Klarna's hosted page. Adyen finalises it from a webhook. This completes end to end
 * today, with the Web SDK contributing only the presentation (messaging, saved payment options and
 * the native pay button).
 *
 * 'sdk' is Klarna's "hosted checkout pages and embedded elements" model, where the purchase journey
 * runs in context instead of sending the shopper away. The Web SDK mints a session token up front
 * and hands it to `initiate`, which is where {@link KlarnaNetwork.authorize} picks it up. It cannot
 * complete yet, and needs three things from `/payments`:
 *
 * 1. Accept `klarnaNetworkSessionToken` and `paymentOptionId` on the payment method. Both are
 *    rejected today with `400 errorCode 702 - Structure of KlarnaDetails contains the following
 *    unknown fields`.
 * 2. Forward them as the `Klarna-Network-Session-Token` header on the *first* `payment/authorize`
 *    call. The shipped flow only sets that header on the second call, after the redirect, which is
 *    what makes Klarna answer `PENDING` rather than `STEP_UP_REQUIRED`.
 * 3. Return the resulting `payment_request_url` unwrapped. Adyen currently seals Klarna's URL inside
 *    `checkoutPaymentRedirect?redirectData=...`, and the SDK reads the region and access token
 *    straight out of the URL it is handed, so the wrapper fails with a Klarna technical error page.
 *    Proposed shape is an `sdk` action, as consumed by {@link getPaymentRequestUrl}: a `redirect`
 *    action would make Drop-in and `handleAction` navigate away and destroy the in-context journey.
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

    private get authorizationFlow(): KlarnaAuthorizationFlow {
        return this.props.authorizationFlow ?? 'redirect';
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
                // Only the SDK flow needs them, and only it can survive the 702 they currently
                // trigger. Sending them in the redirect flow would break a working payment.
                ...(this.authorizationFlow === 'sdk' && {
                    klarnaNetworkSessionToken: this.klarnaNetworkSessionToken,
                    paymentOptionId: this.paymentOptionId
                })
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

            if (this.authorizationFlow === 'sdk') {
                const paymentRequestUrl = getPaymentRequestUrl(response);

                if (!paymentRequestUrl) {
                    console.error('KlarnaNetwork: /payments did not return a Klarna payment request URL. Raw response:', response);
                    throw new AdyenCheckoutError('ERROR', SDK_FLOW_UNSUPPORTED);
                }

                // Klarna runs the purchase journey itself from here, so the element goes back to
                // 'ready' instead of leaving a spinner behind the Klarna overlay.
                this.setElementStatus('ready');
                return { paymentRequestUrl };
            }

            // Redirect flow: hand the response back to the regular Adyen chain, which resolves the
            // 'redirect' action and sends the shopper to Klarna's hosted page.
            this.handleResponse(sanitizeResponse(response));
            return {};
        } catch (error: unknown) {
            // An AdyenCheckoutError is already precise, and re-wrapping it would bury the message.
            this.handleError(
                error instanceof AdyenCheckoutError
                    ? error
                    : new AdyenCheckoutError('ERROR', 'KlarnaNetwork: the payment authorization failed', { cause: error })
            );
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
