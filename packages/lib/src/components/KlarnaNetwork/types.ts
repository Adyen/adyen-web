import type { UIElementProps } from '../internal/UIElement/types';

/**
 * Which of Klarna's two Network integration models authorizes the payment.
 *
 * - 'redirect': Klarna's server-side model, which Adyen has shipped. `/payments` answers
 *   `RedirectShopper` and the shopper completes the purchase on Klarna's hosted page. The Web SDK
 *   only supplies the presentation layer here.
 * - 'sdk': Klarna's "hosted checkout pages and embedded elements" model, where the Web SDK runs the
 *   purchase journey in context. Blocked on `/payments`: see the {@link KlarnaNetwork} JSDoc.
 */
export type KlarnaAuthorizationFlow = 'redirect' | 'sdk';

export interface KlarnaNetworkConfiguration extends UIElementProps {
    /**
     * Klarna partner account client id. The SDK derives playground vs production from its prefix,
     * so no environment configuration is needed.
     */
    clientId: string;

    partnerAccountId?: string;

    /** Passed to the SDK as `acquiringConfig.paymentAccountId`. */
    paymentAccountId?: string;

    /**
     * @defaultValue 'redirect'
     */
    authorizationFlow?: KlarnaAuthorizationFlow;
}
