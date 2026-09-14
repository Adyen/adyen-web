import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PayButton from '../internal/PayButton';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import CancelError from '../../core/Errors/CancelError';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../internal/UIElement/utils';
import { TxVariants } from '../tx-variants';
import { KlarnaNetworkContainer } from './components/KlarnaNetworkContainer/KlarnaNetworkContainer';
import { ERRORS, POC_CLIENT_ID, POC_PAYMENT_ACCOUNT_ID } from './constants';
import { getPaymentRequestUrl } from './utils/get-payment-request-url';

import type { ICore } from '../../core/types';
import type { CheckoutSessionPaymentResponse } from '../../core/CheckoutSession/types';
import type { CheckoutAdvancedFlowResponse, PaymentResponseData } from '../../types/global-types';
import type { PayButtonProps } from '../internal/PayButton/PayButton';
import type { KlarnaNetworkComponentRef, KlarnaNetworkConfiguration } from './types';
import type { KlarnaInitiateParams, PresentationInitiateResult } from './klarna-web-sdk-types';

type PaymentsCallResponse = CheckoutAdvancedFlowResponse | CheckoutSessionPaymentResponse;

/**
 * Proof of concept component for Klarna's Network Distribution Web SDK.
 *
 * Known POC limitations, all verified against the test backend:
 * - The submitted payload is the intended Klarna Network contract, not what today's backend accepts:
 *   `type: 'klarna_network'` plus `klarnaNetworkSessionToken` and `paymentOptionId`. All three are
 *   rejected today, the two fields with `400 errorCode 702 - unknown fields`. `sendKlarnaNetworkData`
 *   can drop the two fields for debugging, and the captured values are always logged.
 * - The journey cannot complete yet. /payments answers `RedirectShopper` with a redirect action to
 *   an Adyen-hosted URL, and Klarna rejects it: "Invalid paymentRequestUrl: cannot extract access
 *   token or region from the URL returned by your initiate callback". Klarna needs a payment request
 *   URL minted by its own Payment Request API, which /payments does not return.
 * - Klarna's presentation API answers `401 PERMISSION_DENIED` for the acquiring `clientId`, so the
 *   SDK silently substitutes a hardcoded fallback presentation and no real Klarna session is ever
 *   created. {@link KLARNA_FALLBACK_PAYMENT_OPTION_IDS} detects it and warns. A plain merchant
 *   `clientId` gets a real presentation from the same origin, both top-level and in an iframe, so
 *   the domain is allowlisted and this is a missing entitlement on the acquiring credential.
 *   Sending or omitting `acquiringConfig` makes no difference.
 * - Klarna picks its regional endpoint from the currency, and these test accounts are NA only: USD
 *   reaches `/na`, EUR answers `404 RESOURCE_NOT_FOUND` on `/eu`. The stories therefore use `US`.
 * - 'PRESELECT_KLARNA' and 'SHOW_ONLY_KLARNA' are logged but not acted on: Drop-in has no preselect
 *   or collapse-others mechanism today.
 * - `isAvailable()` is not overridden, so Drop-in always renders the Klarna row. On 'HIDE_KLARNA' or
 *   any SDK failure the row is still listed and expands to an empty panel. Accepted for the POC.
 * - `klarnaNetworkSessionToken` is a plain config prop; there is no server-side token exchange.
 */
class KlarnaNetwork extends UIElement<KlarnaNetworkConfiguration> {
    public static readonly type = TxVariants.klarna_network;

    protected static readonly defaultProps: Partial<KlarnaNetworkConfiguration> = {
        payButtonVariant: 'klarna',
        intent: 'PAY',
        klarnaButtonStyle: {
            theme: 'default',
            shape: 'default',
            initiationMode: 'DEVICE_BEST'
        },
        clientId: POC_CLIENT_ID,
        paymentAccountId: POC_PAYMENT_ACCOUNT_ID,
        sendKlarnaNetworkData: true
    };

    public componentRef: KlarnaNetworkComponentRef;

    private klarnaNetworkSessionToken?: string;
    private paymentOptionId?: string;

    constructor(checkout: ICore, props?: KlarnaNetworkConfiguration) {
        super(checkout, props);
        this.submit = this.submit.bind(this);
    }

    /**
     * Drop-in validation: Klarna Network collects no shopper input.
     */
    public override get isValid(): boolean {
        return true;
    }

    /**
     * 'klarna_network' is a synthetic tx variant with no icon asset of its own, so the regular
     * 'klarna' logo is served. Overriding the getter instead of defaulting `paymentMethodType`
     * keeps that prop free to mean what it means for every other element.
     */
    public override get icon(): string {
        return this.props.icon ?? this.resources.getImage()(this.props.paymentMethodType ?? TxVariants.klarna);
    }

    /**
     * `props.name` and the /paymentMethods name win, as they do for every other element. Only the
     * base fallback is replaced: it is the tx variant, which would surface as 'klarna_network'.
     */
    public override get displayName(): string {
        const name = super.displayName;
        return name === (KlarnaNetwork.type as string) ? 'Klarna' : name;
    }

    /**
     * No `subtype: 'sdk'` is sent: that makes /payments answer with the classic Klarna widget action
     * (`type: 'sdk'` carrying a client token), which the Network SDK cannot consume. Without it the
     * response carries a `redirect` action whose URL is handed back to Klarna as `paymentRequestUrl`.
     */
    protected formatData() {
        const sendKlarnaData = this.props.sendKlarnaNetworkData ?? true;

        return {
            paymentMethod: {
                type: KlarnaNetwork.type,
                ...(sendKlarnaData && this.klarnaNetworkSessionToken && { klarnaNetworkSessionToken: this.klarnaNetworkSessionToken }),
                ...(sendKlarnaData && this.paymentOptionId && { paymentOptionId: this.paymentOptionId })
            }
        };
    }

    public override submit(): void {
        if (this.props.payButtonVariant === 'klarna' && this.props.showPayButton) {
            this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
            return;
        }

        // Always routed through the SDK: an Adyen /payments call without a Klarna session token
        // cannot authorize the payment.
        this.componentRef.initiatePayment();
    }

    public override activate(): void {
        this.componentRef?.refreshPresentation();
    }

    /**
     * Passed to the Klarna SDK as its `initiate` callback. Klarna guarantees it is invoked with the
     * session token, and expects either a payment request URL to continue from or an empty object.
     */
    private readonly authorize = async ({
        klarnaNetworkSessionToken,
        paymentOptionId
    }: KlarnaInitiateParams): Promise<PresentationInitiateResult> => {
        this.klarnaNetworkSessionToken = klarnaNetworkSessionToken;
        this.paymentOptionId = paymentOptionId;

        console.log('KlarnaNetwork: authorizing with', { klarnaNetworkSessionToken, paymentOptionId });

        try {
            const response = await this.makePaymentsCall();

            console.log('KlarnaNetwork: /payments response', response);

            const paymentRequestUrl = getPaymentRequestUrl(response);

            if (paymentRequestUrl) {
                // Klarna launches the step-up journey itself, so the element goes back to 'ready'
                // instead of leaving a spinner behind the Klarna overlay.
                this.setElementStatus('ready');
                return { paymentRequestUrl };
            }

            this.processPaymentResponse(response);
            return {};
        } catch (error: unknown) {
            this.handleError(
                error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError('ERROR', ERRORS.AUTHORIZATION_FAILED, { cause: error })
            );
            // Rethrown so Klarna surfaces the failure in its own UI.
            throw error;
        }
    };

    /**
     * Same chain as {@link UIElement.executePaymentsCall}, applied to a response the SDK callback
     * already has in hand.
     */
    private processPaymentResponse(response: PaymentsCallResponse): void {
        void Promise.resolve(response)
            .then(sanitizeResponse)
            .then(verifyPaymentDidNotFail)
            .then(this.handleResponse)
            .catch((error: PaymentResponseData | Error) => {
                if (error instanceof CancelError) {
                    this.setElementStatus('ready');
                    return;
                }
                this.handleFailedResult(error as PaymentResponseData);
            });
    }

    private readonly handleKlarnaComplete = (paymentRequest: unknown): void => {
        console.log('KlarnaNetwork: Klarna reported the payment request as complete', paymentRequest);
        this.setElementStatus('ready');
    };

    private readonly handleKlarnaAbort = (paymentRequest: unknown): void => {
        console.log('KlarnaNetwork: the shopper aborted the Klarna payment request', paymentRequest);
        this.handleError(new AdyenCheckoutError('CANCEL'));
    };

    protected override payButton = (props: PayButtonProps) => {
        return <PayButton {...props} onClick={this.submit} />;
    };

    protected override componentToRender(): h.JSX.Element {
        return (
            <KlarnaNetworkContainer
                {...this.props}
                setComponentRef={this.setComponentRef}
                payButton={this.payButton}
                onAuthorize={this.authorize}
                onError={this.handleError}
                onKlarnaComplete={this.handleKlarnaComplete}
                onKlarnaAbort={this.handleKlarnaAbort}
            />
        );
    }
}

export default KlarnaNetwork;
